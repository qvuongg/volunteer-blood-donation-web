import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [pagination.page, filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await api.get(`/admin/events?${params}`);
      if (response.data.success) {
        setEvents(response.data.data.events);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      'cho_duyet': { color: 'warning', label: 'Chờ duyệt' },
      'da_duyet': { color: 'success', label: 'Đã duyệt' },
      'tu_choi': { color: 'danger', label: 'Từ chối' },
      'hoan_thanh': { color: 'secondary', label: 'Hoàn thành' }
    };
    const badge = badges[status] || { color: 'secondary', label: status };
    return <span className={`badge badge-${badge.color}`}>{badge.label}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (loading && events.length === 0) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Quản lý sự kiện</h1>
        <p className="page-description">
          Quản lý tất cả sự kiện hiến máu trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-input"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="cho_duyet">Chờ duyệt</option>
                <option value="da_duyet">Đã duyệt</option>
                <option value="tu_choi">Từ chối</option>
                <option value="hoan_thanh">Hoàn thành</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tìm kiếm</label>
              <input
                type="text"
                className="form-input"
                placeholder="Tìm theo tên sự kiện hoặc địa chỉ..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách sự kiện ({pagination.total})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--gray-50)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>ID</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Tên sự kiện</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Tổ chức</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Bệnh viện</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Thời gian</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Đăng ký</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id_su_kien} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: 'var(--spacing-md)' }}>{event.id_su_kien}</td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{event.ten_su_kien}</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {event.dia_chi}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>{event.ten_don_vi}</td>
                    <td style={{ padding: 'var(--spacing-md)' }}>{event.ten_benh_vien}</td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div>{formatDate(event.ngay_bat_dau)}</div>
                      {event.ngay_ket_thuc && (
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          đến {formatDate(event.ngay_ket_thuc)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-600)' }}>
                        {event.so_luong_dang_ky} người
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      {getStatusBadge(event.trang_thai)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total}
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Trước
            </button>
            <div style={{ padding: 'var(--spacing-xs) var(--spacing-md)', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
              Trang {pagination.page} / {pagination.totalPages}
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Events;

