import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout showSidebar={false}>
    <div className="hero">
      <div className="hero-content">
        <p className="tagline">Hiến giọt máu đào – Trao đời sự sống</p>
        <h1>Quản lý Hiến máu Tình nguyện Đà Nẵng</h1>
        <p className="description">
          Kết nối người hiến máu, tổ chức, bệnh viện, nhóm tình nguyện và quản trị viên trên một nền tảng thống nhất,
          giúp việc vận động và tổ chức hiến máu trở nên nhanh chóng, minh bạch và hiệu quả.
        </p>

        <div className="cta-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
            <button className="btn btn-outline" onClick={() => navigate('/register')}>
            Đăng ký
          </button>
        </div>

        <div className="role-cards">
          <div className="card">
            <h3>Người hiến máu</h3>
            <p>Đăng ký lịch hiến, xem lịch sử, cập nhật hồ sơ và tìm điểm hiến gần nhất.</p>
          </div>
          <div className="card">
            <h3>Tổ chức & Bệnh viện</h3>
            <p>Quản lý sự kiện, duyệt đăng ký, cập nhật kết quả và gửi thông báo khẩn.</p>
          </div>
          <div className="card">
            <h3>Nhóm tình nguyện & Admin</h3>
            <p>Nhận thông báo kêu gọi, chia sẻ thông tin và theo dõi thống kê toàn hệ thống.</p>
          </div>
        </div>
      </div>

      <div className="hero-illustration">
        <div className="blood-drop">
          <span>Donate</span>
        </div>
        <div className="pulse" />
      </div>
    </div>
    </Layout>
  );
};

export default Home;

