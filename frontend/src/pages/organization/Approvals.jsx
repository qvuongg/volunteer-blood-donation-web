import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Approvals = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventId: '',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [filters, allRegistrations]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch events and pending registrations in parallel
      const [eventsRes, registrationsRes] = await Promise.all([
        api.get('/organizations/events'),
        api.get('/approvals/pending')
      ]);

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data.events || []);
      }

      if (registrationsRes.data.success) {
        const regs = registrationsRes.data.data.registrations || [];
        setAllRegistrations(regs);
        setPendingRegistrations(regs);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...allRegistrations];

    // Filter by event
    if (filters.eventId) {
      filtered = filtered.filter(reg => reg.id_su_kien === parseInt(filters.eventId));
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.ho_ten?.toLowerCase().includes(searchLower) ||
        reg.email?.toLowerCase().includes(searchLower) ||
        reg.so_dien_thoai?.includes(searchLower) ||
        reg.ten_su_kien?.toLowerCase().includes(searchLower)
      );
    }

    setPendingRegistrations(filtered);
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Bạn có chắc muốn duyệt đăng ký này?')) return;
    
    try {
      await api.put(`/approvals/registrations/${id}/approve`, {});
      alert('Đã duyệt thành công');
      fetchData();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Lý do từ chối:');
    if (!reason) return;

    try {
      await api.put(`/approvals/registrations/${id}/reject`, { ghi_chu_duyet: reason });
      alert('Đã từ chối');
      fetchData();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
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
        <h1 className="page-title">Duyệt đăng ký</h1>
        <p className="page-description">
          Duyệt các đăng ký hiến máu chờ xử lý
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Lọc theo sự kiện</label>
              <select
                className="form-input"
                value={filters.eventId}
                onChange={(e) => setFilters(prev => ({ ...prev, eventId: e.target.value }))}
              >
                <option value="">Tất cả sự kiện</option>
                {events.map(event => (
                  <option key={event.id_su_kien} value={event.id_su_kien}>
                    {event.ten_su_kien} - {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tìm kiếm</label>
              <input
                type="text"
                className="form-input"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {pendingRegistrations.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              {allRegistrations.length === 0 
                ? 'Không có đăng ký nào chờ duyệt'
                : 'Không tìm thấy đăng ký nào phù hợp với bộ lọc'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <div className="card-body">
              <p style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                Tổng số đăng ký chờ duyệt: <span style={{ color: 'var(--primary-600)' }}>{pendingRegistrations.length}</span>
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--gray-50)' }}>
                    <tr>
                      <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>STT</th>
                      <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Người hiến</th>
                      <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Sự kiện</th>
                      <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Ngày đăng ký</th>
                      <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Nhóm máu</th>
                      <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRegistrations.map((reg, index) => (
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
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{reg.ten_su_kien}</div>
                          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            {new Date(reg.ngay_bat_dau).toLocaleDateString('vi-VN')}
                            {reg.ngay_ket_thuc && ` - ${new Date(reg.ngay_ket_thuc).toLocaleDateString('vi-VN')}`}
                          </div>
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
                          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprove(reg.id_dang_ky)}
                            >
                              Duyệt
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleReject(reg.id_dang_ky)}
                            >
                              Từ chối
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Approvals;
