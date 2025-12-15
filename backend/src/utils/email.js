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

export default { sendOTPEmail, sendRegistrationApprovalEmail };


