import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const BloodTypeConfirmation = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    fetchUnconfirmedDonors();
  }, []);

  const fetchUnconfirmedDonors = async () => {
    try {
      const response = await api.get('/hospitals/blood-types/unconfirmed');
      console.log('📋 Response from API:', response.data);
      if (response.data.success) {
        const donorList = response.data.data.donors || [];
        console.log('👥 Donors list:', donorList);
        setDonors(donorList);
      }
    } catch (error) {
      console.error('❌ Error fetching unconfirmed donors:', error);
      console.error('Response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (donor) => {
    const confirmed = window.confirm(
      `Xác nhận nhóm máu ${donor.nhom_mau} cho người hiến máu ${donor.ho_ten}?`
    );
    
    if (!confirmed) return;

    setConfirming(donor.id_nguoi_hien);

    try {
      const response = await api.post('/hospitals/blood-types/confirm', {
        id_nguoi_hien: donor.id_nguoi_hien,
        nhom_mau: donor.nhom_mau,
        ghi_chu: `Xác thực nhóm máu ${donor.nhom_mau} sau xét nghiệm tại bệnh viện`
      });

      if (response.data.success) {
        alert('Xác thực nhóm máu thành công!');
        // Remove from list
        setDonors(donors.filter(d => d.id_nguoi_hien !== donor.id_nguoi_hien));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setConfirming(null);
    }
  };

  const handleChangeAndConfirm = async (donor) => {
    const bloodTypes = ['A', 'B', 'AB', 'O'];
    const newBloodType = window.prompt(
      `Nhóm máu hiện tại: ${donor.nhom_mau}\n` +
      `Nhập nhóm máu mới (${bloodTypes.join(', ')}):`,
      donor.nhom_mau
    );

    if (!newBloodType || !bloodTypes.includes(newBloodType.toUpperCase())) {
      alert('Nhóm máu không hợp lệ');
      return;
    }

    setConfirming(donor.id_nguoi_hien);

    try {
      const response = await api.post('/hospitals/blood-types/confirm', {
        id_nguoi_hien: donor.id_nguoi_hien,
        nhom_mau: newBloodType.toUpperCase(),
        ghi_chu: `Xác thực nhóm máu ${newBloodType.toUpperCase()} sau xét nghiệm tại bệnh viện (đã điều chỉnh từ ${donor.nhom_mau})`
      });

      if (response.data.success) {
        alert('Xác thực nhóm máu thành công!');
        setDonors(donors.filter(d => d.id_nguoi_hien !== donor.id_nguoi_hien));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setConfirming(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Xác thực nhóm máu</h1>
        <p className="page-description">
          Xác thực nhóm máu cho người hiến máu sau khi xét nghiệm
        </p>
      </div>

      {donors.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <path d="M32 8s-16 14-16 20a16 16 0 0032 0c0-6-16-20-16-20z"/>
              <path d="M22 28l4 4 8-8"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Không có người hiến máu nào cần xác thực nhóm máu
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="alert alert-info" style={{ marginBottom: 'var(--spacing-xl)' }}>
            ℹ️ Danh sách người hiến máu đã tham gia sự kiện tại bệnh viện của bạn nhưng nhóm máu chưa được xác thực chính thức.
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Nhóm máu (tự khai)</th>
                  <th>Số lần hiến</th>
                  <th>Hiến gần nhất</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {donors.map(donor => (
                  <tr key={donor.id_nguoi_hien}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {donor.ho_ten}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{donor.email}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{donor.so_dien_thoai || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <span style={{ 
                          fontSize: 'var(--font-size-lg)', 
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--primary-600)'
                        }}>
                          {donor.nhom_mau}
                        </span>
                        <span className="badge badge-warning">Chưa xác thực</span>
                      </div>
                    </td>
                    <td>{donor.tong_so_lan_hien}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>
                      {donor.ngay_hien_gan_nhat 
                        ? new Date(donor.ngay_hien_gan_nhat).toLocaleDateString('vi-VN')
                        : '-'
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleConfirm(donor)}
                          disabled={confirming === donor.id_nguoi_hien}
                        >
                          {confirming === donor.id_nguoi_hien ? (
                            <>
                              <LoadingSpinner size="small" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M6 8l2 2 4-4"/>
                              </svg>
                              Xác nhận
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleChangeAndConfirm(donor)}
                          disabled={confirming === donor.id_nguoi_hien}
                        >
                          Điều chỉnh & Xác nhận
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="card-body">
              <h4 style={{ marginTop: 0 }}>📋 Lưu ý quan trọng</h4>
              <ul style={{ marginBottom: 0, paddingLeft: 'var(--spacing-lg)', lineHeight: 'var(--line-height-relaxed)' }}>
                <li>Chỉ xác thực sau khi đã thực hiện xét nghiệm nhóm máu chính thức</li>
                <li>Nếu nhóm máu tự khai không khớp với kết quả xét nghiệm, chọn "Điều chỉnh & Xác nhận"</li>
                <li>Sau khi xác thực, người hiến máu sẽ thấy badge "Đã xác thực" trên hồ sơ</li>
                <li>Hành động này không thể hoàn tác, vui lòng kiểm tra kỹ trước khi xác nhận</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default BloodTypeConfirmation;

