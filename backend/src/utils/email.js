import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendOTPEmail = async (email, otp, purpose = 'xác thực') => {
  const purposeText = purpose === 'forgot-password' 
    ? 'đặt lại mật khẩu' 
    : 'xác thực tài khoản';

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Hệ thống hiến máu Đà Nẵng',
    to: email,
    subject: 'Mã xác thực OTP - Hệ thống hiến máu Đà Nẵng',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Hiến giọt máu đào - Trao đời sự sống</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Mã xác thực OTP</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Bạn đã yêu cầu mã OTP để ${purposeText}.
          </p>
          <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0; border: 2px dashed #667eea;">
            <h1 style="color: #667eea; font-size: 48px; letter-spacing: 12px; margin: 0; font-weight: bold;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            <strong>Mã OTP này có hiệu lực trong 5 phút.</strong>
          </p>
          <p style="color: #999; font-size: 14px; line-height: 1.6;">
            Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này và không chia sẻ mã OTP với bất kỳ ai.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © 2025 Hệ thống quản lý hiến máu tình nguyện Đà Nẵng<br>
            Email này được gửi tự động, vui lòng không trả lời.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Không thể gửi email. Vui lòng kiểm tra cấu hình email.');
  }
};

export const sendRegistrationApprovalEmail = async (email, donorName, eventInfo, approvalStatus, note = '') => {
  const isApproved = approvalStatus === 'da_duyet';
  const statusText = isApproved ? 'được duyệt' : 'bị từ chối';
  const statusColor = isApproved ? '#16a34a' : '#dc2626';
  const statusIcon = isApproved ? '✅' : '❌';

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Hệ thống hiến máu Đà Nẵng',
    to: email,
    subject: `${statusIcon} Thông báo ${statusText} đơn đăng ký hiến máu`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🩸 Hiến giọt máu đào - Trao đời sự sống</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: ${isApproved ? '#dcfce7' : '#fee2e2'}; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${statusColor};">
            <h2 style="color: ${statusColor}; margin-top: 0;">
              ${statusIcon} Đơn đăng ký ${statusText}
            </h2>
          </div>

          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Kính chào <strong>${donorName}</strong>,
          </p>
          
          ${isApproved ? `
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Chúng tôi xin thông báo đơn đăng ký hiến máu của bạn đã được <strong style="color: #16a34a;">chấp nhận</strong>. 
              Cảm ơn bạn đã tham gia hoạt động hiến máu nhân đạo!
            </p>
          ` : `
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Rất tiếc, đơn đăng ký hiến máu của bạn chưa được chấp nhận lần này. 
              Chúng tôi hy vọng sẽ có cơ hội đón chào bạn trong các đợt hiến máu tiếp theo.
            </p>
          `}

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #111827; margin-top: 0; font-size: 18px;">📍 Thông tin sự kiện:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Tên sự kiện:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #111827;">${eventInfo.ten_su_kien}</td>
              </tr>
              ${eventInfo.ngay_hen_hien ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Ngày hẹn:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #dc2626;">${new Date(eventInfo.ngay_hen_hien).toLocaleDateString('vi-VN')}</td>
              </tr>
              ` : ''}
              ${eventInfo.khung_gio ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Khung giờ:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #dc2626;">${eventInfo.khung_gio}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Địa điểm:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #111827;">${eventInfo.ten_dia_diem}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Địa chỉ:</td>
                <td style="padding: 8px 0; color: #6b7280;">${eventInfo.dia_chi}</td>
              </tr>
            </table>
          </div>

          ${note ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <strong style="color: #92400e;">Ghi chú từ tổ chức:</strong>
              <p style="color: #78350f; margin: 8px 0 0 0; line-height: 1.6;">${note}</p>
            </div>
          ` : ''}

          ${isApproved ? `
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">💡 Lưu ý quan trọng:</h3>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Vui lòng đến đúng giờ đã đăng ký</li>
                <li>Mang theo CMND/CCCD để xác minh danh tính</li>
                <li>Ăn uống đầy đủ trước khi hiến máu (2-3 giờ trước)</li>
                <li>Uống đủ nước trước và sau khi hiến máu</li>
                <li>Nghỉ ngơi đầy đủ trước ngày hiến máu</li>
                <li>Không sử dụng rượu bia 24h trước khi hiến máu</li>
              </ul>
            </div>
          ` : ''}

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © 2025 Hệ thống quản lý hiến máu tình nguyện Đà Nẵng<br>
            Email này được gửi tự động, vui lòng không trả lời.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Registration approval email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    // Don't throw error to not block the approval process
  }
};

// Helper function to create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send blood type confirmation email
export const sendBloodTypeConfirmationEmail = async (email, name, bloodType, hospitalName, note) => {
  const emailTransporter = createTransporter();
  
  const subject = 'Xác thực nhóm máu - Hệ thống Hiến máu Đà Nẵng';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Xác thực nhóm máu</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Nhóm máu của bạn đã được xác thực chính thức bởi <strong>${hospitalName}</strong>.</p>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Nhóm máu:</strong> <span style="color: #dc2626; font-size: 18px;">${bloodType}</span></p>
        ${note ? `<p style="margin: 5px 0;"><strong>Ghi chú:</strong> ${note}</p>` : ''}
      </div>
      
      <p>Thông tin này đã được cập nhật vào hồ sơ của bạn.</p>
      <p>Cảm ơn bạn đã tham gia hiến máu!</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Email này được gửi tự động từ Hệ thống Hiến máu Đà Nẵng. Vui lòng không trả lời email này.
      </p>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hienmau.danang.vn',
      to: email,
      subject,
      html
    });
    console.log(`✅ Sent blood type confirmation email to ${email}`);
  } catch (error) {
    console.error('❌ Error sending blood type confirmation email:', error);
  }
};

// Send event approval email to organization
export const sendEventApprovalEmail = async (email, name, eventName, status, hospitalName, ly_do = null) => {
  const emailTransporter = createTransporter();
  
  const isApproved = status === 'da_duyet';
  const subject = isApproved 
    ? 'Sự kiện hiến máu đã được phê duyệt' 
    : 'Sự kiện hiến máu bị từ chối';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isApproved ? '#10b981' : '#dc2626'};">${subject}</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Sự kiện <strong>"${eventName}"</strong> của bạn đã được ${isApproved ? 'phê duyệt' : 'từ chối'} bởi <strong>${hospitalName}</strong>.</p>
      
      ${isApproved ? `
        <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #065f46;">
            ✅ Sự kiện đã được phê duyệt. Bạn có thể bắt đầu quản lý đăng ký và chuẩn bị cho sự kiện.
          </p>
        </div>
      ` : `
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 0; color: #991b1b;">
            ❌ Sự kiện bị từ chối. ${ly_do ? 'Vui lòng xem lý do bên dưới.' : 'Vui lòng liên hệ với bệnh viện để biết thêm chi tiết.'}
          </p>
        </div>
        ${ly_do ? `
        <div style="background: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <strong style="color: #92400e;">Lý do từ chối:</strong>
          <p style="color: #78350f; margin: 8px 0 0 0; line-height: 1.6; white-space: pre-line;">${ly_do}</p>
        </div>
        ` : ''}
      `}
      
      <p>Bạn có thể xem chi tiết sự kiện trong hệ thống.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Email này được gửi tự động từ Hệ thống Hiến máu Đà Nẵng. Vui lòng không trả lời email này.
      </p>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hienmau.danang.vn',
      to: email,
      subject,
      html
    });
    console.log(`✅ Sent event approval email to ${email}`);
  } catch (error) {
    console.error('❌ Error sending event approval email:', error);
  }
};

// Send donation result email
export const sendDonationResultEmail = async (email, name, eventName, result, volume, date) => {
  const emailTransporter = createTransporter();
  
  const isSuccess = result === 'Dat';
  const subject = isSuccess 
    ? 'Kết quả hiến máu - Thành công' 
    : 'Thông báo kết quả hiến máu';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isSuccess ? '#dc2626' : '#6b7280'};">Kết quả hiến máu</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Kết quả hiến máu của bạn tại sự kiện <strong>"${eventName}"</strong> đã được cập nhật.</p>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Ngày hiến:</strong> ${new Date(date).toLocaleDateString('vi-VN')}</p>
        <p style="margin: 5px 0;"><strong>Lượng máu:</strong> ${volume} ml</p>
        <p style="margin: 5px 0;"><strong>Kết quả:</strong> <span style="color: ${isSuccess ? '#10b981' : '#6b7280'}; font-weight: bold;">${result}</span></p>
      </div>
      
      ${isSuccess ? `
        <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #065f46;">
            🎉 Chúc mừng! Bạn đã hiến thành công ${volume}ml máu. Cảm ơn bạn đã đóng góp vào cộng đồng!
          </p>
        </div>
        <p>💡 Lưu ý:</p>
        <ul>
          <li>Nghỉ ngơi đầy đủ và uống nhiều nước</li>
          <li>Tránh vận động mạnh trong 24h</li>
          <li>Có thể hiến máu lại sau 12 tuần</li>
        </ul>
      ` : `
        <p>Vui lòng liên hệ với bệnh viện để biết thêm chi tiết về kết quả.</p>
      `}
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Email này được gửi tự động từ Hệ thống Hiến máu Đà Nẵng. Vui lòng không trả lời email này.
      </p>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hienmau.danang.vn',
      to: email,
      subject,
      html
    });
    console.log(`✅ Sent donation result email to ${email}`);
  } catch (error) {
    console.error('❌ Error sending donation result email:', error);
  }
};

// Send emergency notification to volunteer groups
export const sendEmergencyNotificationEmail = async (email, name, title, content, hospitalName) => {
  const emailTransporter = createTransporter();
  
  const subject = `🚨 KHẨN CẤP: ${title}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
        <h2 style="color: #dc2626; margin-top: 0;">🚨 THÔNG BÁO KHẨN CẤP</h2>
      </div>
      
      <p>Xin chào <strong>${name}</strong>,</p>
      <p><strong>${hospitalName}</strong> đã gửi thông báo khẩn cấp đến nhóm tình nguyện của bạn:</p>
      
      <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="color: #92400e; margin-top: 0;">${title}</h3>
        <p style="color: #78350f; white-space: pre-line;">${content}</p>
      </div>
      
      <p>Vui lòng kiểm tra hệ thống và hỗ trợ nếu có thể.</p>
      <p>Cảm ơn sự hỗ trợ của bạn!</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Email này được gửi tự động từ Hệ thống Hiến máu Đà Nẵng. Vui lòng không trả lời email này.
      </p>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hienmau.danang.vn',
      to: email,
      subject,
      html
    });
    console.log(`✅ Sent emergency notification email to ${email}`);
  } catch (error) {
    console.error('❌ Error sending emergency notification email:', error);
  }
};

// Send registration confirmation email (when donor registers for event)
export const sendRegistrationConfirmationEmail = async (email, name, eventInfo) => {
  const emailTransporter = createTransporter();
  
  const subject = 'Đăng ký hiến máu thành công - Hệ thống Hiến máu Đà Nẵng';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">✅ Đăng ký thành công!</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tham gia sự kiện hiến máu. Đơn đăng ký của bạn đã được ghi nhận và đang chờ tổ chức xét duyệt.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #111827; margin-top: 0;">📍 Thông tin sự kiện:</h3>
        <p style="margin: 5px 0;"><strong>Tên sự kiện:</strong> ${eventInfo.ten_su_kien}</p>
        <p style="margin: 5px 0;"><strong>Ngày hẹn hiến:</strong> ${new Date(eventInfo.ngay_hen_hien).toLocaleDateString('vi-VN')}</p>
        <p style="margin: 5px 0;"><strong>Khung giờ:</strong> ${eventInfo.khung_gio}</p>
        <p style="margin: 5px 0;"><strong>Địa điểm:</strong> ${eventInfo.ten_dia_diem}</p>
        <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${eventInfo.dia_chi}</p>
      </div>
      
      <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; color: #1e40af;">
          ℹ️ Đơn đăng ký của bạn đang chờ tổ chức xét duyệt. Bạn sẽ nhận được email thông báo khi đơn được duyệt.
        </p>
      </div>

      <p><strong>💡 Lưu ý trước khi hiến máu:</strong></p>
      <ul>
        <li>Mang theo CMND/CCCD để xác minh danh tính</li>
        <li>Ăn uống đầy đủ trước khi hiến máu (2-3 giờ trước)</li>
        <li>Uống đủ nước trước và sau khi hiến máu</li>
        <li>Nghỉ ngơi đầy đủ trước ngày hiến máu</li>
        <li>Không sử dụng rượu bia 24h trước khi hiến máu</li>
      </ul>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Email này được gửi tự động từ Hệ thống Hiến máu Đà Nẵng. Vui lòng không trả lời email này.
      </p>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hienmau.danang.vn',
      to: email,
      subject,
      html
    });
    console.log(`✅ Sent registration confirmation email to ${email}`);
  } catch (error) {
    console.error('❌ Error sending registration confirmation email:', error);
  }
};

// Send event cancellation/update email
export const sendEventUpdateEmail = async (email, name, eventName, updateType, reason) => {
  const emailTransporter = createTransporter();
  
  const isCancellation = updateType === 'cancel';
  const subject = isCancellation 
    ? `🚫 Sự kiện "${eventName}" đã bị hủy`
    : `📢 Thay đổi quan trọng: Sự kiện "${eventName}"`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${isCancellation ? '#fef2f2' : '#fef3c7'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${isCancellation ? '#dc2626' : '#f59e0b'};">
        <h2 style="color: ${isCancellation ? '#dc2626' : '#92400e'}; margin-top: 0;">
          ${isCancellation ? '🚫 Sự kiện đã bị hủy' : '📢 Thông báo thay đổi sự kiện'}
        </h2>
      </div>
      
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Chúng tôi xin thông báo về sự kiện <strong>"${eventName}"</strong> mà bạn đã đăng ký tham gia:</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #111827; margin-top: 0;">${isCancellation ? 'Sự kiện đã bị hủy' : 'Thông tin thay đổi'}</h3>
        <p style="color: #6b7280; margin: 0; white-space: pre-line;">${reason}</p>
      </div>
      
      ${isCancellation ? `
        <p>Chúng tôi rất tiếc về sự bất tiện này. Bạn có thể:</p>
        <ul>
          <li>Tìm kiếm các sự kiện hiến máu khác trong hệ thống</li>
          <li>Liên hệ với tổ chức để biết thêm chi tiết</li>
        </ul>
      ` : `
        <p>Vui lòng lưu ý thông tin mới và điều chỉnh lịch trình của bạn cho phù hợp.</p>
      `}
      
      <p>Cảm ơn sự quan tâm và đồng hành của bạn!</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Email này được gửi tự động từ Hệ thống Hiến máu Đà Nẵng. Vui lòng không trả lời email này.
      </p>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hienmau.danang.vn',
      to: email,
      subject,
      html
    });
    console.log(`✅ Sent event update email to ${email}`);
  } catch (error) {
    console.error('❌ Error sending event update email:', error);
  }
};

// Send new event notification email to hospital
export const sendNewEventNotificationEmail = async (email, name, eventName, organizationName, eventInfo) => {
  const emailTransporter = createTransporter();
  
  const subject = '📋 Sự kiện hiến máu mới cần phê duyệt - Hệ thống Hiến máu Đà Nẵng';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🩸 Hiến giọt máu đào - Trao đời sự sống</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
          <h2 style="color: #1e40af; margin-top: 0;">
            📋 Sự kiện hiến máu mới cần phê duyệt
          </h2>
        </div>

        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Kính chào <strong>${name}</strong>,
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Tổ chức <strong>${organizationName}</strong> đã tạo một sự kiện hiến máu mới và đang chờ bạn phê duyệt.
        </p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="color: #111827; margin-top: 0; font-size: 18px;">📍 Thông tin sự kiện:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Tên sự kiện:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #111827;">${eventName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Tổ chức:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #111827;">${organizationName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Ngày bắt đầu:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #dc2626;">${new Date(eventInfo.ngay_bat_dau).toLocaleDateString('vi-VN')}</td>
            </tr>
            ${eventInfo.ngay_ket_thuc ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Ngày kết thúc:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #dc2626;">${new Date(eventInfo.ngay_ket_thuc).toLocaleDateString('vi-VN')}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Địa điểm:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #111827;">${eventInfo.ten_dia_diem}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Địa chỉ:</td>
              <td style="padding: 8px 0; color: #6b7280;">${eventInfo.dia_chi}</td>
            </tr>
            ${eventInfo.so_luong_du_kien ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Số lượng dự kiến:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #111827;">${eventInfo.so_luong_du_kien} người</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; margin-top: 0; font-size: 16px;">💡 Hành động cần thực hiện:</h3>
          <p style="color: #78350f; margin: 0; line-height: 1.8;">
            Vui lòng đăng nhập vào hệ thống để xem chi tiết và phê duyệt sự kiện này. Sự kiện sẽ không được hiển thị công khai cho đến khi được bạn phê duyệt.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          © 2025 Hệ thống quản lý hiến máu tình nguyện Đà Nẵng<br>
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hienmau.danang.vn',
      to: email,
      subject,
      html
    });
    console.log(`✅ Sent new event notification email to ${email}`);
  } catch (error) {
    console.error('❌ Error sending new event notification email:', error);
  }
};

// Send pending approval email for new registrations
export const sendPendingApprovalEmail = async (email, name, roleName) => {
  const emailTransporter = createTransporter();
  
  const roleNames = {
    'to_chuc': 'Người phụ trách tổ chức',
    'benh_vien': 'Người phụ trách bệnh viện',
    'nhom_tinh_nguyen': 'Nhóm tình nguyện'
  };
  
  const subject = 'Đăng ký tài khoản thành công - Đang chờ duyệt';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🩸 Hiến giọt máu đào - Trao đời sự sống</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
          <h2 style="color: #92400e; margin-top: 0;">
            ⏳ Tài khoản đang chờ duyệt
          </h2>
        </div>

        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Kính chào <strong>${name}</strong>,
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Cảm ơn bạn đã đăng ký tài khoản với vai trò <strong>${roleNames[roleName] || roleName}</strong> trong hệ thống quản lý hiến máu tình nguyện Đà Nẵng.
        </p>

        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">ℹ️ Thông tin quan trọng:</h3>
          <p style="color: #1e40af; margin: 0; line-height: 1.8;">
            Tài khoản của bạn đang chờ được duyệt bởi quản trị viên. Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt và có thể sử dụng các tính năng của hệ thống.
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="color: #111827; margin-top: 0; font-size: 16px;">📋 Các bước tiếp theo:</h3>
          <ol style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Quản trị viên sẽ xem xét thông tin đăng ký của bạn</li>
            <li>Bạn sẽ nhận được email thông báo khi tài khoản được duyệt</li>
            <li>Sau khi được duyệt, bạn có thể đăng nhập và sử dụng hệ thống</li>
          </ol>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với quản trị viên hệ thống.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          © 2025 Hệ thống quản lý hiến máu tình nguyện Đà Nẵng<br>
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hienmau.danang.vn',
      to: email,
      subject,
      html
    });
    console.log(`✅ Sent pending approval email to ${email}`);
  } catch (error) {
    console.error('❌ Error sending pending approval email:', error);
    throw error;
  }
};

// Send account approval email when admin approves account
export const sendAccountApprovalEmail = async (email, name, roleName) => {
  const emailTransporter = createTransporter();
  
  const roleNames = {
    'to_chuc': 'Người phụ trách tổ chức',
    'benh_vien': 'Người phụ trách bệnh viện',
    'nhom_tinh_nguyen': 'Nhóm tình nguyện'
  };
  
  const subject = '✅ Tài khoản đã được duyệt - Hệ thống Hiến máu Đà Nẵng';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🩸 Hiến giọt máu đào - Trao đời sự sống</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
          <h2 style="color: #065f46; margin-top: 0;">
            ✅ Tài khoản đã được duyệt thành công
          </h2>
        </div>

        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Kính chào <strong>${name}</strong>,
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Chúng tôi xin thông báo tài khoản của bạn với vai trò <strong>${roleNames[roleName] || roleName}</strong> đã được quản trị viên duyệt thành công.
        </p>

        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">🎉 Bạn có thể sử dụng hệ thống ngay bây giờ!</h3>
          <p style="color: #1e40af; margin: 0; line-height: 1.8;">
            Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập và sử dụng tất cả các tính năng dành cho vai trò của mình.
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="color: #111827; margin-top: 0; font-size: 16px;">📋 Các bước tiếp theo:</h3>
          <ol style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Đăng nhập vào hệ thống bằng email và mật khẩu đã đăng ký</li>
            <li>Hoàn thiện thông tin hồ sơ của bạn (nếu cần)</li>
            <li>Bắt đầu sử dụng các tính năng của hệ thống</li>
          </ol>
        </div>

        ${roleName === 'to_chuc' ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #78350f; margin: 0; line-height: 1.6;">
              💡 <strong>Gợi ý:</strong> Bạn có thể bắt đầu tạo sự kiện hiến máu và quản lý đăng ký của người hiến máu.
            </p>
          </div>
        ` : ''}

        ${roleName === 'benh_vien' ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #78350f; margin: 0; line-height: 1.6;">
              💡 <strong>Gợi ý:</strong> Bạn có thể duyệt sự kiện hiến máu, xác nhận nhóm máu và cập nhật kết quả hiến máu.
            </p>
          </div>
        ` : ''}

        ${roleName === 'nhom_tinh_nguyen' ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #78350f; margin: 0; line-height: 1.6;">
              💡 <strong>Gợi ý:</strong> Bạn có thể xem và chia sẻ thông báo từ bệnh viện để kêu gọi hiến máu.
            </p>
          </div>
        ` : ''}

        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với quản trị viên hệ thống.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          © 2025 Hệ thống quản lý hiến máu tình nguyện Đà Nẵng<br>
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hienmau.danang.vn',
      to: email,
      subject,
      html
    });
    console.log(`✅ Sent account approval email to ${email}`);
  } catch (error) {
    console.error('❌ Error sending account approval email:', error);
    throw error;
  }
};

export default { 
  sendOTPEmail, 
  sendRegistrationApprovalEmail,
  sendBloodTypeConfirmationEmail,
  sendEventApprovalEmail,
  sendDonationResultEmail,
  sendEmergencyNotificationEmail,
  sendRegistrationConfirmationEmail,
  sendEventUpdateEmail,
  sendNewEventNotificationEmail,
  sendPendingApprovalEmail,
  sendAccountApprovalEmail
};


