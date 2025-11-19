const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Về chúng tôi</h4>
          <p>
            Hệ thống quản lý hiến máu tình nguyện Đà Nẵng - 
            Kết nối yêu thương, lan tỏa sự sống.
          </p>
        </div>

        <div className="footer-section">
          <h4>Liên kết</h4>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/login">Đăng nhập</a></li>
            <li><a href="/register">Đăng ký</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <ul>
            <li>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 3h12v10H2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 3l6 5 6-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              <span>hienmau@danang.gov.vn</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 3h1.5L6 8l-1.5 2h7L10 8l1.5-5H13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
              <span>(0236) 123 4567</span>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a5 5 0 00-5 5c0 3.75 5 8.33 5 8.33s5-4.58 5-8.33a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              <span>Đà Nẵng, Việt Nam</span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Theo dõi chúng tôi</h4>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            <a href="#" aria-label="Youtube">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Hiến Máu Đà Nẵng. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;

