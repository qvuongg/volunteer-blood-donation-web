import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { sendOTPEmail, sendPendingApprovalEmail } from '../utils/email.js';

// Tạo mã OTP ngẫu nhiên 6 số
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user
export const register = async (req, res, next) => {
  try {
    const { 
      ho_ten, email, mat_khau, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro,
      // Additional fields for special roles
      ten_don_vi, dia_chi_to_chuc, chuc_vu_to_chuc,
      ten_benh_vien, dia_chi_benh_vien, chuc_vu_benh_vien,
      ten_nhom, dia_chi_nhom
    } = req.body;

    // Validate required fields
    if (!ho_ten || !email || !mat_khau || !gioi_tinh || !ngay_sinh || !id_vai_tro) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc.'
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id_nguoi_dung FROM nguoidung WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng.'
      });
    }

    // Check if phone already exists (if provided)
    if (so_dien_thoai) {
      const [existingPhones] = await pool.execute(
        'SELECT id_nguoi_dung FROM nguoidung WHERE so_dien_thoai = ?',
        [so_dien_thoai]
      );

      if (existingPhones.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã được sử dụng.'
        });
      }
    }

    // Get role name
    const [roles] = await pool.execute(
      'SELECT ten_vai_tro FROM vaitro WHERE id_vai_tro = ?',
      [id_vai_tro]
    );

    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ.'
      });
    }

    const roleName = roles[0]?.ten_vai_tro;

    // Validate additional fields based on role
    if (roleName === 'to_chuc') {
      if (!ten_don_vi || !dia_chi_to_chuc) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin tổ chức.'
        });
      }
    } else if (roleName === 'benh_vien') {
      if (!ten_benh_vien || !dia_chi_benh_vien) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin bệnh viện.'
        });
      }
    } else if (roleName === 'nhom_tinh_nguyen') {
      if (!ten_nhom) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền tên nhóm tình nguyện.'
        });
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(mat_khau, saltRounds);

    // Set trang_thai: true for nguoi_hien, false for others (need approval)
    const trang_thai = roleName === 'nguoi_hien' ? true : false;

    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO nguoidung (ho_ten, email, mat_khau, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ho_ten, email, hashedPassword, so_dien_thoai || null, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai]
    );

    const userId = result.insertId;

    // Create role-specific records
    if (roleName === 'nguoi_hien') {
      await pool.execute(
        'INSERT INTO nguoi_hien_mau (id_nguoi_hien) VALUES (?)',
        [userId]
      );
    } else if (roleName === 'to_chuc') {
      // Create organization
      const [orgResult] = await pool.execute(
        'INSERT INTO to_chuc (ten_don_vi, dia_chi) VALUES (?, ?)',
        [ten_don_vi, dia_chi_to_chuc]
      );
      const orgId = orgResult.insertId;
      
      // Create organization coordinator
      await pool.execute(
        'INSERT INTO nguoi_phu_trach_to_chuc (id_nguoi_phu_trach, id_to_chuc, chuc_vu) VALUES (?, ?, ?)',
        [userId, orgId, chuc_vu_to_chuc || null]
      );
    } else if (roleName === 'benh_vien') {
      // Create hospital
      const [hospitalResult] = await pool.execute(
        'INSERT INTO benh_vien (ten_benh_vien, dia_chi) VALUES (?, ?)',
        [ten_benh_vien, dia_chi_benh_vien]
      );
      const hospitalId = hospitalResult.insertId;
      
      // Create hospital coordinator
      await pool.execute(
        'INSERT INTO nguoi_phu_trach_benh_vien (id_nguoi_phu_trach, id_benh_vien, chuc_vu) VALUES (?, ?, ?)',
        [userId, hospitalId, chuc_vu_benh_vien || null]
      );
    } else if (roleName === 'nhom_tinh_nguyen') {
      // Create volunteer group
      await pool.execute(
        'INSERT INTO nhom_tinh_nguyen (id_nguoi_dung, ten_nhom, dia_chi) VALUES (?, ?, ?)',
        [userId, ten_nhom, dia_chi_nhom || null]
      );
    }

    // Get created user
    const [users] = await pool.execute(
      `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai 
       FROM nguoidung WHERE id_nguoi_dung = ?`,
      [userId]
    );

    const user = users[0];

    // Send email notification for pending approval roles
    if (!trang_thai) {
      try {
        await sendPendingApprovalEmail(email, ho_ten, roleName);
      } catch (emailError) {
        console.error('❌ Error sending pending approval email:', emailError);
        // Don't fail registration if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: trang_thai 
        ? 'Đăng ký thành công. Bạn có thể đăng nhập ngay.'
        : 'Đăng ký thành công. Tài khoản của bạn đang chờ được duyệt bởi quản trị viên.',
      data: {
        user: {
          ...user,
          ten_vai_tro: roleName
        },
        requiresApproval: !trang_thai
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    console.log('🔐 LOGIN ATTEMPT:', {
      email: req.body.email,
      hasPassword: !!req.body.mat_khau,
      bodyKeys: Object.keys(req.body)
    });

    const { email, mat_khau } = req.body;

    if (!email || !mat_khau) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu.'
      });
    }

    // Get user from database
    console.log('📊 Querying database for email:', email);
    const [users] = await pool.execute(
      `SELECT id_nguoi_dung, ho_ten, email, mat_khau, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai 
       FROM nguoidung WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng.'
      });
    }

    const user = users[0];
    console.log('✅ User found:', { 
      id: user.id_nguoi_dung, 
      email: user.email,
      role: user.id_vai_tro,
      active: user.trang_thai 
    });

    // Check if account is active
    if (!user.trang_thai) {
      console.log('❌ Account not active');
      
      // Get role to determine if it's pending approval or deactivated
      const [roles] = await pool.execute(
        'SELECT ten_vai_tro FROM vaitro WHERE id_vai_tro = ?',
        [user.id_vai_tro]
      );
      const roleName = roles[0]?.ten_vai_tro;
      
      // Check if user has associated records (means it's a new registration pending approval)
      let isPendingApproval = false;
      if (roleName === 'to_chuc') {
        const [org] = await pool.execute(
          'SELECT id_nguoi_phu_trach FROM nguoi_phu_trach_to_chuc WHERE id_nguoi_phu_trach = ?',
          [user.id_nguoi_dung]
        );
        isPendingApproval = org.length > 0;
      } else if (roleName === 'benh_vien') {
        const [hospital] = await pool.execute(
          'SELECT id_nguoi_phu_trach FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
          [user.id_nguoi_dung]
        );
        isPendingApproval = hospital.length > 0;
      } else if (roleName === 'nhom_tinh_nguyen') {
        const [group] = await pool.execute(
          'SELECT id_nguoi_dung FROM nhom_tinh_nguyen WHERE id_nguoi_dung = ?',
          [user.id_nguoi_dung]
        );
        isPendingApproval = group.length > 0;
      }
      
      return res.status(403).json({
        success: false,
        message: isPendingApproval 
          ? 'Tài khoản của bạn chưa được hoạt động. Vui lòng liên hệ quản trị viên.'
          : 'Tài khoản đã bị vô hiệu hóa.'
      });
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const isPasswordValid = await bcrypt.compare(mat_khau, user.mat_khau);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng.'
      });
    }

    console.log('✅ Password valid');

    // Get role name
    const [roles] = await pool.execute(
      'SELECT ten_vai_tro FROM vaitro WHERE id_vai_tro = ?',
      [user.id_vai_tro]
    );

    const roleName = roles[0]?.ten_vai_tro;
    console.log('👤 Role:', roleName);

    // Get organization/hospital/volunteer group name based on role
    let organizationName = null;
    if (roleName === 'benh_vien') {
      const [hospital] = await pool.execute(
        `SELECT bv.ten_benh_vien
         FROM nguoi_phu_trach_benh_vien nptbv
         JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
         WHERE nptbv.id_nguoi_phu_trach = ?`,
        [user.id_nguoi_dung]
      );
      organizationName = hospital[0]?.ten_benh_vien || null;
    } else if (roleName === 'to_chuc') {
      const [organization] = await pool.execute(
        `SELECT tc.ten_don_vi
         FROM nguoi_phu_trach_to_chuc nptc
         JOIN to_chuc tc ON nptc.id_to_chuc = tc.id_to_chuc
         WHERE nptc.id_nguoi_phu_trach = ?`,
        [user.id_nguoi_dung]
      );
      organizationName = organization[0]?.ten_don_vi || null;
    } else if (roleName === 'nhom_tinh_nguyen') {
      const [volunteerGroup] = await pool.execute(
        `SELECT ten_nhom FROM nhom_tinh_nguyen WHERE id_nguoi_dung = ?`,
        [user.id_nguoi_dung]
      );
      organizationName = volunteerGroup[0]?.ten_nhom || null;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id_nguoi_dung },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('🎟️ Token generated');

    // Remove password from response
    const { mat_khau: _, ...userWithoutPassword } = user;

    const response = {
      success: true,
      message: 'Đăng nhập thành công.',
      data: {
        token,
        user: {
          ...userWithoutPassword,
          ten_vai_tro: roleName,
          ten_to_chuc: organizationName // Tên bệnh viện/tổ chức/nhóm tình nguyện
        }
      }
    };

    console.log('✅ LOGIN SUCCESS:', {
      userId: user.id_nguoi_dung,
      email: user.email,
      role: roles[0]?.ten_vai_tro
    });

    res.json(response);
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    next(error);
  }
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const userRole = req.user.ten_vai_tro;

    // Get organization/hospital/volunteer group name based on role
    let organizationName = null;
    if (userRole === 'benh_vien') {
      const [hospital] = await pool.execute(
        `SELECT bv.ten_benh_vien
         FROM nguoi_phu_trach_benh_vien nptbv
         JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
         WHERE nptbv.id_nguoi_phu_trach = ?`,
        [userId]
      );
      organizationName = hospital[0]?.ten_benh_vien || null;
    } else if (userRole === 'to_chuc') {
      const [organization] = await pool.execute(
        `SELECT tc.ten_don_vi
         FROM nguoi_phu_trach_to_chuc nptc
         JOIN to_chuc tc ON nptc.id_to_chuc = tc.id_to_chuc
         WHERE nptc.id_nguoi_phu_trach = ?`,
        [userId]
      );
      organizationName = organization[0]?.ten_don_vi || null;
    } else if (userRole === 'nhom_tinh_nguyen') {
      const [volunteerGroup] = await pool.execute(
        `SELECT ten_nhom FROM nhom_tinh_nguyen WHERE id_nguoi_dung = ?`,
        [userId]
      );
      organizationName = volunteerGroup[0]?.ten_nhom || null;
    }

    res.json({
      success: true,
      data: {
        user: {
          ...req.user,
          ten_to_chuc: organizationName
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get full profile based on role
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const userRole = req.user.ten_vai_tro;

    const profile = {
      user: req.user
    };

    // Get additional info based on role
    if (userRole === 'nguoi_hien') {
      const [donors] = await pool.execute(
        `SELECT nh.*, bv.ten_benh_vien as ten_benh_vien_xac_nhan
         FROM nguoi_hien_mau nh
         LEFT JOIN benh_vien bv ON nh.id_benh_vien_xac_nhan = bv.id_benh_vien
         WHERE nh.id_nguoi_dung = ?`,
        [userId]
      );
      profile.donor = donors[0] || null;
    } else if (userRole === 'benh_vien') {
      const [coordinator] = await pool.execute(
        `SELECT nptbv.*, bv.ten_benh_vien, bv.dia_chi
         FROM nguoi_phu_trach_benh_vien nptbv
         JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
         WHERE nptbv.id_nguoi_phu_trach = ?`,
        [userId]
      );
      if (coordinator.length > 0) {
        profile.coordinator = {
          id_nguoi_phu_trach: coordinator[0].id_nguoi_phu_trach,
          chuc_vu: coordinator[0].chuc_vu
        };
        profile.hospital = {
          id_benh_vien: coordinator[0].id_benh_vien,
          ten_benh_vien: coordinator[0].ten_benh_vien,
          dia_chi: coordinator[0].dia_chi
        };
      }
    } else if (userRole === 'to_chuc') {
      const [coordinator] = await pool.execute(
        `SELECT nptc.*, tc.ten_don_vi, tc.dia_chi
         FROM nguoi_phu_trach_to_chuc nptc
         JOIN to_chuc tc ON nptc.id_to_chuc = tc.id_to_chuc
         WHERE nptc.id_nguoi_dung = ?`,
        [userId]
      );
      if (coordinator.length > 0) {
        profile.coordinator = {
          id_nguoi_phu_trach: coordinator[0].id_nguoi_phu_trach,
          chuc_vu: coordinator[0].chuc_vu
        };
        profile.organization = {
          id_to_chuc: coordinator[0].id_to_chuc,
          ten_don_vi: coordinator[0].ten_don_vi,
          dia_chi: coordinator[0].dia_chi
        };
      }
    } else if (userRole === 'nhom_tinh_nguyen') {
      const [group] = await pool.execute(
        `SELECT * FROM nhom_tinh_nguyen WHERE id_nguoi_dung = ?`,
        [userId]
      );
      profile.volunteerGroup = group[0] || null;
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// Gửi OTP qua email (cho quên mật khẩu)
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email.'
      });
    }

    // Kiểm tra email có tồn tại không
    const [users] = await pool.execute(
      'SELECT id_nguoi_dung FROM nguoidung WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email không tồn tại trong hệ thống.'
      });
    }

    // Tạo OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // Đánh dấu các OTP cũ của email này là đã dùng (bảo mật)
    await pool.execute(
      'UPDATE otp_codes SET used = TRUE WHERE email = ? AND used = FALSE',
      [email]
    );

    // Lưu OTP mới vào database
    await pool.execute(
      'INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Gửi email
    await sendOTPEmail(email, otp, 'forgot-password');

    res.json({
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn.'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    next(error);
  }
};

// Xác thực OTP
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ email và mã OTP.'
      });
    }

    const [otpRecords] = await pool.execute(
      `SELECT id, created_at FROM otp_codes 
       WHERE email = ? AND otp = ? AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng yêu cầu mã mới.'
      });
    }

    res.json({
      success: true,
      message: 'Xác thực OTP thành công.'
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    next(error);
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, mat_khau_moi } = req.body;

    if (!email || !otp || !mat_khau_moi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin.'
      });
    }

    if (mat_khau_moi.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự.'
      });
    }

    // Xác thực OTP lần nữa
    const [otpRecords] = await pool.execute(
      `SELECT id FROM otp_codes 
       WHERE email = ? AND otp = ? AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng yêu cầu mã mới.'
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(mat_khau_moi, 10);

    // Cập nhật mật khẩu
    await pool.execute(
      'UPDATE nguoidung SET mat_khau = ? WHERE email = ?',
      [hashedPassword, email]
    );

    // Đánh dấu OTP đã sử dụng
    await pool.execute(
      'UPDATE otp_codes SET used = TRUE WHERE id = ?',
      [otpRecords[0].id]
    );

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    next(error);
  }
};

// Send OTP for registration
export const sendRegistrationOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email.'
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id_nguoi_dung FROM nguoidung WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this email
    await pool.execute(
      'DELETE FROM otp_codes WHERE email = ?',
      [email]
    );

    // Save OTP to database
    await pool.execute(
      'INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Send OTP email
    await sendOTPEmail(email, otp, 'registration');

    console.log(`📧 Registration OTP sent to ${email}: ${otp}`);

    res.json({
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn.'
    });
  } catch (error) {
    console.error('❌ Send registration OTP error:', error);
    next(error);
  }
};

// Verify OTP for registration
export const verifyRegistrationOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mã OTP.'
      });
    }

    // Find OTP
    const [otpRecords] = await pool.execute(
      'SELECT * FROM otp_codes WHERE email = ? AND otp = ? AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không hợp lệ hoặc đã được sử dụng.'
      });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(otpRecords[0].expires_at);

    if (now > expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.'
      });
    }

    // Mark OTP as used
    await pool.execute(
      'UPDATE otp_codes SET used = TRUE WHERE id = ?',
      [otpRecords[0].id]
    );

    res.json({
      success: true,
      message: 'Xác thực OTP thành công. Vui lòng hoàn tất đăng ký.'
    });
  } catch (error) {
    console.error('❌ Verify registration OTP error:', error);
    next(error);
  }
};

