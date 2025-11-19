import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const RegistrationList = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  
  const [registrations, setRegistrations] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchRegistrations();
    }
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get(`/hospitals/events/${eventId}/registrations`);
      if (response.data.success) {
        setRegistrations(response.data.data.registrations || []);
        // TODO: fetch event info
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  if (!eventId) {
    return (
      <Layout>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Vui lòng chọn sự kiện để xem danh sách đăng ký
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Danh sách đăng ký</h1>
        <p className="page-description">
          Người hiến máu đã đăng ký và được tổ chức phê duyệt
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <path d="M16 32h32M32 16v32"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Chưa có người đăng ký nào được phê duyệt
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Tổng số: <span style={{ color: 'var(--primary-600)' }}>{registrations.length}</span> người
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 2h8v2H4zM2 6h12v6H2zM4 14h8v-2H4z"/>
                  </svg>
                  In danh sách
                </button>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Nhóm máu</th>
                  <th>Trạng thái xác thực</th>
                  <th>Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, index) => (
                  <tr key={reg.id_dang_ky}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {reg.ho_ten}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{reg.email}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{reg.so_dien_thoai || '-'}</td>
                    <td>
                      <span style={{ 
                        fontSize: 'var(--font-size-lg)', 
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--primary-600)'
                      }}>
                        {reg.nhom_mau || '?'}
                      </span>
                    </td>
                    <td>
                      {reg.nhom_mau_xac_nhan ? (
                        <span className="badge badge-success">Đã xác thực</span>
                      ) : (
                        <span className="badge badge-warning">Chưa xác thực</span>
                      )}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>
                      {new Date(reg.ngay_dang_ky).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
};

export default RegistrationList;

