import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Registrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/registrations/my');
      if (response.data.success) {
        setRegistrations(response.data.data.registrations);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'da_duyet': { label: 'Đã duyệt', class: 'badge-success' },
      'cho_duyet': { label: 'Chờ duyệt', class: 'badge-warning' },
      'tu_choi': { label: 'Từ chối', class: 'badge-danger' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'badge-gray' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
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
        <h1 className="page-title">Lịch đăng ký của tôi</h1>
        <p className="page-description">
          Theo dõi tất cả đăng ký hiến máu của bạn
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <path d="M8 24h48M8 32h48M8 40h48"/>
              <rect x="4" y="12" width="56" height="44" rx="4"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Bạn chưa đăng ký sự kiện nào
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Sự kiện</th>
                <th>Ngày hẹn</th>
                <th>Khung giờ</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th>Kết quả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr 
                  key={reg.id_dang_ky}
                  onClick={() => navigate(`/donor/registrations/${reg.id_dang_ky}`)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {reg.ten_su_kien}
                  </td>
                  <td style={{ color: '#dc2626', fontWeight: 'var(--font-weight-semibold)' }}>
                    {reg.ngay_hen_hien ? formatDate(reg.ngay_hen_hien) : '-'}
                  </td>
                  <td style={{ color: '#dc2626', fontWeight: 'var(--font-weight-semibold)' }}>
                    {reg.khung_gio || '-'}
                  </td>
                  <td>{formatDate(reg.ngay_dang_ky)}</td>
                  <td>{getStatusBadge(reg.trang_thai)}</td>
                  <td>
                    {reg.id_ket_qua ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: 'var(--font-size-xl)' }}>🎉</span>
                        <span style={{ color: '#16a34a', fontWeight: 'var(--font-weight-semibold)' }}>
                          {reg.luong_ml} ml
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>-</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/donor/registrations/${reg.id_dang_ky}`);
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Registrations;
