import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';

const Users = () => {
  const { success, error: toastError } = useToast();
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmButtonColor: 'primary'
  });

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
      toastError('Lỗi khi tải danh sách người dùng');
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
        success('Cập nhật người dùng thành công');
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      console.error('Error:', error);
      toastError('Lỗi khi cập nhật người dùng');
    }
  };

  const handleToggleStatus = (userId, currentStatus) => {
    setConfirmation({
      isOpen: true,
      title: currentStatus ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng',
      message: `Bạn có chắc muốn ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} người dùng này?`,
      confirmButtonColor: currentStatus ? 'warning' : 'success',
      onConfirm: () => processToggleStatus(userId, currentStatus)
    });
  };

  const processToggleStatus = async (userId, currentStatus) => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));

    try {
      const response = await api.put(`/admin/users/${userId}/status`, {
        trang_thai: !currentStatus
      });
      if (response.data.success) {
        success('Cập nhật trạng thái thành công');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      console.error('Error:', error);
      toastError('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = (userId) => {
    setConfirmation({
      isOpen: true,
      title: 'Xóa người dùng',
      message: 'Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác!',
      confirmButtonColor: 'danger',
      onConfirm: () => processDelete(userId)
    });
  };

  const processDelete = async (userId) => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));

    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        success('Xóa người dùng thành công');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      console.error('Error:', error);
      toastError('Lỗi khi xóa người dùng');
    }
  };

  const handleViewDetail = async (userId) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      if (response.data.success) {
        setUserDetail(response.data.data);
        setSelectedUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Error:', error);
      console.error('Error:', error);
      toastError('Lỗi khi tải thông tin chi tiết');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
              <thead style={{ background: 'var(--gray-50)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)', fontSize: 'var(--font-size-sm)' }}>ID</th>
                  <th style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)', fontSize: 'var(--font-size-sm)' }}>Họ tên</th>
                  <th style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)', fontSize: 'var(--font-size-sm)' }}>Email</th>
                  <th style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)', fontSize: 'var(--font-size-sm)' }}>Số điện thoại</th>
                  <th style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)', fontSize: 'var(--font-size-sm)' }}>Vai trò</th>
                  <th style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)', fontSize: 'var(--font-size-sm)' }}>Trạng thái</th>
                  <th style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)', fontSize: 'var(--font-size-sm)' }}>Ngày tạo</th>
                  <th style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'center', borderBottom: '1px solid var(--gray-200)', fontSize: 'var(--font-size-sm)' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id_nguoi_dung} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>{user.id_nguoi_dung}</td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>{user.ho_ten}</td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>{user.email}</td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>{user.so_dien_thoai || '-'}</td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                      <span className={`badge badge-${getRoleBadgeColor(user.ten_vai_tro)}`}>
                        {getRoleLabel(user.ten_vai_tro)}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                      <span className={`badge badge-${user.trang_thai ? 'success' : 'secondary'}`}>
                        {user.trang_thai ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                      {new Date(user.ngay_tao).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center', flexWrap: 'nowrap' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewDetail(user.id_nguoi_dung)}
                          title="Xem chi tiết"
                          style={{ padding: 'var(--spacing-xs)', minWidth: 'auto', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 3C4.5 3 1.73 5.11 1 8c.73 2.89 3.5 5 7 5s6.27-2.11 7-5c-.73-2.89-3.5-5-7-5zm0 8.5c-1.93 0-3.5-1.57-3.5-3.5S6.07 4.5 8 4.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-5.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleEdit(user)}
                          title="Sửa"
                          style={{ padding: 'var(--spacing-xs)', minWidth: 'auto', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                          </svg>
                        </button>
                        <button
                          className={`btn btn-sm ${user.trang_thai ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(user.id_nguoi_dung, user.trang_thai)}
                          title={user.trang_thai ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          style={{ padding: 'var(--spacing-xs)', minWidth: 'auto', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {user.trang_thai ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                            </svg>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user.id_nguoi_dung)}
                          title="Xóa"
                          style={{ padding: 'var(--spacing-xs)', minWidth: 'auto', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                          </svg>
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

      {/* Detail Modal */}
      {showDetailModal && userDetail && (
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
          zIndex: 1000,
          padding: 'var(--spacing-lg)'
        }}>
          <div className="card" style={{ width: '700px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Chi tiết người dùng</h3>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setUserDetail(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="card-body">
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {/* User Basic Info */}
                  <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', borderBottom: '2px solid var(--primary-600)', paddingBottom: 'var(--spacing-xs)' }}>
                      Thông tin cá nhân
                    </h4>
                    <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Họ tên
                        </label>
                        <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>{userDetail.user.ho_ten}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Email
                        </label>
                        <p style={{ margin: 0 }}>{userDetail.user.email}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Số điện thoại
                        </label>
                        <p style={{ margin: 0 }}>{userDetail.user.so_dien_thoai || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Giới tính
                        </label>
                        <p style={{ margin: 0 }}>{userDetail.user.gioi_tinh}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Ngày sinh
                        </label>
                        <p style={{ margin: 0 }}>{new Date(userDetail.user.ngay_sinh).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Vai trò
                        </label>
                        <span className={`badge badge-${getRoleBadgeColor(userDetail.user.ten_vai_tro)}`}>
                          {getRoleLabel(userDetail.user.ten_vai_tro)}
                        </span>
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Trạng thái
                        </label>
                        <span className={`badge badge-${userDetail.user.trang_thai ? 'success' : 'secondary'}`}>
                          {userDetail.user.trang_thai ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Ngày tạo
                        </label>
                        <p style={{ margin: 0 }}>{new Date(userDetail.user.ngay_tao).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Organization Info */}
                  {userDetail.user.ten_vai_tro === 'to_chuc' && userDetail.organization && (
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                      <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', borderBottom: '2px solid var(--warning-600)', paddingBottom: 'var(--spacing-xs)' }}>
                        Thông tin tổ chức
                      </h4>
                      <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Tên đơn vị
                          </label>
                          <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>{userDetail.organization.ten_don_vi}</p>
                        </div>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Chức vụ
                          </label>
                          <p style={{ margin: 0 }}>{userDetail.coordinator?.chuc_vu || 'Chưa cập nhật'}</p>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Địa chỉ
                          </label>
                          <p style={{ margin: 0 }}>{userDetail.organization.dia_chi || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hospital Info */}
                  {userDetail.user.ten_vai_tro === 'benh_vien' && userDetail.hospital && (
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                      <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', borderBottom: '2px solid var(--success-600)', paddingBottom: 'var(--spacing-xs)' }}>
                        Thông tin bệnh viện
                      </h4>
                      <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Tên bệnh viện
                          </label>
                          <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>{userDetail.hospital.ten_benh_vien}</p>
                        </div>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Chức vụ
                          </label>
                          <p style={{ margin: 0 }}>{userDetail.coordinator?.chuc_vu || 'Chưa cập nhật'}</p>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Địa chỉ
                          </label>
                          <p style={{ margin: 0 }}>{userDetail.hospital.dia_chi || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Volunteer Group Info */}
                  {userDetail.user.ten_vai_tro === 'nhom_tinh_nguyen' && userDetail.volunteerGroup && (
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                      <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', borderBottom: '2px solid var(--secondary-600)', paddingBottom: 'var(--spacing-xs)' }}>
                        Thông tin nhóm tình nguyện
                      </h4>
                      <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Tên nhóm
                          </label>
                          <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>{userDetail.volunteerGroup.ten_nhom}</p>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Địa chỉ
                          </label>
                          <p style={{ margin: 0 }}>{userDetail.volunteerGroup.dia_chi || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Donor Info */}
                  {userDetail.user.ten_vai_tro === 'nguoi_hien' && userDetail.donor && (
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                      <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', borderBottom: '2px solid var(--primary-600)', paddingBottom: 'var(--spacing-xs)' }}>
                        Thông tin hiến máu
                      </h4>
                      <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Nhóm máu
                          </label>
                          <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                            {userDetail.donor.nhom_mau || 'Chưa xác định'}
                          </p>
                        </div>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Nhóm máu đã xác thực
                          </label>
                          <span className={`badge badge-${userDetail.donor.nhom_mau_xac_nhan ? 'success' : 'secondary'}`}>
                            {userDetail.donor.nhom_mau_xac_nhan ? 'Đã xác thực' : 'Chưa xác thực'}
                          </span>
                        </div>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Tổng số lần hiến
                          </label>
                          <p style={{ margin: 0 }}>{userDetail.donor.tong_so_lan_hien || 0} lần</p>
                        </div>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Lần hiến gần nhất
                          </label>
                          <p style={{ margin: 0 }}>
                            {userDetail.donor.lan_hien_gan_nhat
                              ? new Date(userDetail.donor.lan_hien_gan_nhat).toLocaleDateString('vi-VN')
                              : 'Chưa có'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="card-footer" style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setUserDetail(null);
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        confirmButtonColor={confirmation.confirmButtonColor}
      />
    </Layout>
  );
};

export default Users;

