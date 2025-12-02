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

export default { sendOTPEmail };

