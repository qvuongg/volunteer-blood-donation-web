import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.role && { role: filters.role }),
        ...(filters.status !== '' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await api.get(`/admin/users?${params}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      ho_ten: user.ho_ten,
      email: user.email,
      so_dien_thoai: user.so_dien_thoai || '',
      gioi_tinh: user.gioi_tinh,
      ngay_sinh: user.ngay_sinh.split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/admin/users/${selectedUser.id_nguoi_dung}`, editForm);
      if (response.data.success) {
        alert('Cập nhật người dùng thành công');
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi cập nhật người dùng');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!confirm(`Bạn có chắc muốn ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} người dùng này?`)) {
      return;
    }

    try {
      const response = await api.put(`/admin/users/${userId}/status`, {
        trang_thai: !currentStatus
      });
      if (response.data.success) {
        alert('Cập nhật trạng thái thành công');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác!')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        alert('Xóa người dùng thành công');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi xóa người dùng');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': 'danger',
      'nguoi_hien': 'primary',
      'to_chuc': 'warning',
      'benh_vien': 'success',
      'nhom_tinh_nguyen': 'secondary'
    };
    return colors[role] || 'secondary';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'admin': 'Quản trị viên',
      'nguoi_hien': 'Người hiến máu',
      'to_chuc': 'Tổ chức',
      'benh_vien': 'Bệnh viện',
      'nhom_tinh_nguyen': 'Tình nguyện viên'
    };
    return labels[role] || role;
  };

  if (loading && users.length === 0) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Quản lý người dùng</h1>
        <p className="page-description">
          Quản lý tất cả người dùng trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-4" style={{ gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">Vai trò</label>
                <select
                  className="form-input"
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="nguoi_hien">Người hiến máu</option>
                  <option value="to_chuc">Tổ chức</option>
                  <option value="benh_vien">Bệnh viện</option>
                  <option value="nhom_tinh_nguyen">Tình nguyện viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-input"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="1">Hoạt động</option>
                  <option value="0">Vô hiệu hóa</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Tìm kiếm</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tìm theo tên hoặc email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách người dùng ({pagination.total})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--gray-50)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>ID</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Họ tên</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Email</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Số điện thoại</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Vai trò</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Trạng thái</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Ngày tạo</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'center', borderBottom: '1px solid var(--gray-200)' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id_nguoi_dung} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: 'var(--spacing-md)' }}>{user.id_nguoi_dung}</td>
                    <td style={{ padding: 'var(--spacing-md)' }}>{user.ho_ten}</td>
                    <td style={{ padding: 'var(--spacing-md)' }}>{user.email}</td>
                    <td style={{ padding: 'var(--spacing-md)' }}>{user.so_dien_thoai || '-'}</td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <span className={`badge badge-${getRoleBadgeColor(user.ten_vai_tro)}`}>
                        {getRoleLabel(user.ten_vai_tro)}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <span className={`badge badge-${user.trang_thai ? 'success' : 'secondary'}`}>
                        {user.trang_thai ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      {new Date(user.ngay_tao).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleEdit(user)}
                          title="Sửa"
                        >
                          Sửa
                        </button>
                        <button
                          className={`btn btn-sm ${user.trang_thai ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(user.id_nguoi_dung, user.trang_thai)}
                          title={user.trang_thai ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {user.trang_thai ? 'Tắt' : 'Bật'}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user.id_nguoi_dung)}
                          title="Xóa"
                        >
                          Xóa
                        </button>
                      </div>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <div className="card-header">
              <h3 className="card-title">Chỉnh sửa người dùng</h3>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Họ tên *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.ho_ten}
                    onChange={(e) => setEditForm(prev => ({ ...prev, ho_ten: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editForm.so_dien_thoai}
                    onChange={(e) => setEditForm(prev => ({ ...prev, so_dien_thoai: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Giới tính *</label>
                  <select
                    className="form-input"
                    value={editForm.gioi_tinh}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gioi_tinh: e.target.value }))}
                    required
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="Khac">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ngày sinh *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editForm.ngay_sinh}
                    onChange={(e) => setEditForm(prev => ({ ...prev, ngay_sinh: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="card-footer" style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Users;

