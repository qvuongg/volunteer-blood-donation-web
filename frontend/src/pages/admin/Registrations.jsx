import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    event: '',
    donor: ''
  });

  useEffect(() => {
    fetchRegistrations();
  }, [pagination.page, filters]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.event && { event: filters.event }),
        ...(filters.donor && { donor: filters.donor })
      });

      const response = await api.get(`/admin/registrations?${params}`);
      if (response.data.success) {
        setRegistrations(response.data.data.registrations);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải danh sách đăng ký');
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
      'da_hoan_thanh': { color: 'secondary', label: 'Hoàn thành' }
    };
    const badge = badges[status] || { color: 'secondary', label: status };
    return <span className={`badge badge-${badge.color}`}>{badge.label}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getBloodTypeBadge = (bloodType) => {
    const colors = ['A', 'B', 'AB'].includes(bloodType?.charAt(0)) ? 'danger' : 'primary';
    return <span className={`badge badge-${colors}`}>{bloodType || 'N/A'}</span>;
  };

  if (loading && registrations.length === 0) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Quản lý đăng ký hiến máu</h1>
        <p className="page-description">
          Quản lý tất cả đăng ký hiến máu trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-md)' }}>
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
                <option value="da_hoan_thanh">Hoàn thành</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">ID Sự kiện</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập ID sự kiện..."
                value={filters.event}
                onChange={(e) => handleFilterChange('event', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">ID Người hiến</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập ID người hiến..."
                value={filters.donor}
                onChange={(e) => handleFilterChange('donor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách đăng ký ({pagination.total})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--gray-50)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>ID</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Người hiến</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Nhóm máu</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Sự kiện</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Ngày đăng ký</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id_dang_ky} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: 'var(--spacing-md)' }}>{reg.id_dang_ky}</td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{reg.ho_ten}</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {reg.email}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {reg.so_dien_thoai}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      {getBloodTypeBadge(reg.nhom_mau)}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{reg.ten_su_kien}</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {formatDate(reg.ngay_bat_dau)}
                        {reg.ngay_ket_thuc && ` - ${formatDate(reg.ngay_ket_thuc)}`}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      {formatDate(reg.ngay_dang_ky)}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      {getStatusBadge(reg.trang_thai)}
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

export default Registrations;

