import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const EventRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventRes, regsRes] = await Promise.all([
        api.get(`/organizations/events/${id}`),
        api.get(`/organizations/events/${id}/registrations`)
      ]);

      if (eventRes.data.success) {
        setEvent(eventRes.data.data.event);
      }

      if (regsRes.data.success) {
        setRegistrations(regsRes.data.data.registrations || []);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải dữ liệu: ' + (error.response?.data?.message || error.message));
      navigate('/organization/events');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.trang_thai === filter;
  });

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
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Danh sách đăng ký</h1>
          <p className="page-description">
            {event ? `Sự kiện: ${event.ten_su_kien}` : 'Đang tải...'}
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => navigate(`/organization/events/${id}`)}
        >
          Quay lại
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              Tất cả ({registrations.length})
            </button>
            <button
              className={`btn ${filter === 'cho_duyet' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('cho_duyet')}
            >
              Chờ duyệt ({registrations.filter(r => r.trang_thai === 'cho_duyet').length})
            </button>
            <button
              className={`btn ${filter === 'da_duyet' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('da_duyet')}
            >
              Đã duyệt ({registrations.filter(r => r.trang_thai === 'da_duyet').length})
            </button>
            <button
              className={`btn ${filter === 'tu_choi' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('tu_choi')}
            >
              Từ chối ({registrations.filter(r => r.trang_thai === 'tu_choi').length})
            </button>
          </div>
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              {registrations.length === 0 
                ? 'Chưa có đăng ký nào cho sự kiện này'
                : 'Không có đăng ký nào phù hợp với bộ lọc'}
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--gray-50)' }}>
                  <tr>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>STT</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Người hiến</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Ngày đăng ký</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Nhóm máu</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Trạng thái</th>
                    {filter === 'cho_duyet' && (
                      <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg, index) => (
                    <tr key={reg.id_dang_ky} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: 'var(--spacing-md)' }}>{index + 1}</td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{reg.ho_ten}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          {reg.email}
                        </div>
                        {reg.so_dien_thoai && (
                          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            {reg.so_dien_thoai}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                        {new Date(reg.ngay_dang_ky).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        <span className="badge badge-danger" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                          {reg.nhom_mau || '?'}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        {getStatusBadge(reg.trang_thai)}
                      </td>
                      {filter === 'cho_duyet' && (
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={async () => {
                                if (!window.confirm('Bạn có chắc muốn duyệt đăng ký này?')) return;
                                try {
                                  await api.put(`/approvals/registrations/${reg.id_dang_ky}/approve`, {});
                                  alert('Đã duyệt thành công');
                                  fetchData();
                                } catch (error) {
                                  alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
                                }
                              }}
                            >
                              Duyệt
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={async () => {
                                const reason = window.prompt('Lý do từ chối:');
                                if (!reason) return;
                                try {
                                  await api.put(`/approvals/registrations/${reg.id_dang_ky}/reject`, { ghi_chu_duyet: reason });
                                  alert('Đã từ chối');
                                  fetchData();
                                } catch (error) {
                                  alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
                                }
                              }}
                            >
                              Từ chối
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EventRegistrations;

