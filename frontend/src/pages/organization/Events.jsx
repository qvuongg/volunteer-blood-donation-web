import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, name: '' });
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/organizations/events');
      if (response.data.success) {
        // API có thể trả về events trực tiếp hoặc trong pagination
        const eventsData = response.data.data.events || response.data.data;
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Lỗi khi tải danh sách sự kiện: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
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

  const getEventStatusBadge = (event) => {
    if (event.trang_thai !== 'da_duyet') {
      return null; // Chỉ hiển thị trạng thái diễn ra cho sự kiện đã duyệt
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(event.ngay_bat_dau);
    startDate.setHours(0, 0, 0, 0);
    const endDate = event.ngay_ket_thuc ? new Date(event.ngay_ket_thuc) : null;
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    if (endDate && today > endDate) {
      return <span className="badge badge-gray">Đã kết thúc</span>;
    } else if (today >= startDate && (!endDate || today <= endDate)) {
      return <span className="badge badge-success">Đang diễn ra</span>;
    } else {
      return <span className="badge badge-info">Sắp diễn ra</span>;
    }
  };

  // Hàm xác định trạng thái thời gian của sự kiện (chỉ cho sự kiện đã duyệt)
  const getEventTimeStatus = (event) => {
    if (event.trang_thai !== 'da_duyet') {
      return 0; // Không áp dụng cho sự kiện chưa duyệt
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(event.ngay_bat_dau);
    startDate.setHours(0, 0, 0, 0);
    const endDate = event.ngay_ket_thuc ? new Date(event.ngay_ket_thuc) : null;
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    // 1 = Sắp diễn ra, 2 = Đang diễn ra, 3 = Đã kết thúc
    if (endDate && today > endDate) {
      return 3; // Đã kết thúc - ở cuối
    } else if (today >= startDate && (!endDate || today <= endDate)) {
      return 2; // Đang diễn ra
    } else {
      return 1; // Sắp diễn ra - ưu tiên cao nhất
    }
  };

  // Sắp xếp và lọc events
  const sortedAndFilteredEvents = events
    .filter(event => {
      if (filter === 'all') return true;
      return event.trang_thai === filter;
    })
    .sort((a, b) => {
      // Ưu tiên theo trạng thái: cho_duyet > da_duyet > tu_choi
      const statusPriority = {
        'cho_duyet': 1,
        'da_duyet': 2,
        'tu_choi': 3
      };
      const priorityA = statusPriority[a.trang_thai] || 99;
      const priorityB = statusPriority[b.trang_thai] || 99;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Trong phần "Đã duyệt", sắp xếp theo trạng thái thời gian
      if (a.trang_thai === 'da_duyet' && b.trang_thai === 'da_duyet') {
        const timeStatusA = getEventTimeStatus(a);
        const timeStatusB = getEventTimeStatus(b);
        
        if (timeStatusA !== timeStatusB) {
          return timeStatusA - timeStatusB; // Sắp diễn ra (1) > Đang diễn ra (2) > Đã kết thúc (3)
        }
      }
      
      // Trong cùng nhóm, sắp xếp theo ngày bắt đầu (sắp diễn ra trước)
      const dateA = new Date(a.ngay_bat_dau);
      const dateB = new Date(b.ngay_bat_dau);
      return dateA - dateB;
    });

  const handleDelete = (id, name) => {
    setConfirmDialog({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    const { id } = confirmDialog;
    setConfirmDialog({ isOpen: false, id: null, name: '' });
    
    try {
      await api.delete(`/organizations/events/${id}`);
      // Xóa ngay trong state để UI update ngay lập tức
      setEvents(prevEvents => prevEvents.filter(event => event.id_su_kien !== id));
      showToast('Xóa sự kiện thành công!', 'success');
      // Fetch lại để đảm bảo sync với server
      fetchEvents();
    } catch (error) {
      console.error('Error:', error);
      showToast('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message), 'error');
      // Nếu xóa thất bại, fetch lại để đảm bảo state đúng
      fetchEvents();
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
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Quản lý sự kiện</h1>
          <p className="page-description">Tạo và quản lý các sự kiện hiến máu</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/organization/events/new')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5v10m5-5H5"/>
          </svg>
        Tạo sự kiện mới
      </button>
      </div>

      {/* Bộ lọc trạng thái */}
      {events.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-body">
            <label className="form-label" style={{ marginBottom: 'var(--spacing-sm)' }}>
              Bộ lọc trạng thái
            </label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              <button
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('all')}
              >
                Tất cả ({events.length})
              </button>
              <button
                className={`btn ${filter === 'cho_duyet' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('cho_duyet')}
              >
                Chờ duyệt ({events.filter(e => e.trang_thai === 'cho_duyet').length})
              </button>
              <button
                className={`btn ${filter === 'da_duyet' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('da_duyet')}
              >
                Đã duyệt ({events.filter(e => e.trang_thai === 'da_duyet').length})
              </button>
              <button
                className={`btn ${filter === 'tu_choi' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('tu_choi')}
              >
                Từ chối ({events.filter(e => e.trang_thai === 'tu_choi').length})
              </button>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Chưa có sự kiện nào
            </p>
          </div>
        </div>
      ) : sortedAndFilteredEvents.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Không có sự kiện nào phù hợp với bộ lọc
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {sortedAndFilteredEvents.map(event => (
            <div key={event.id_su_kien} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{event.ten_su_kien}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', alignItems: 'flex-end' }}>
                  {getStatusBadge(event.trang_thai)}
                    {getEventStatusBadge(event)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <strong>Bệnh viện:</strong> {event.ten_benh_vien}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <strong>Ngày:</strong> {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')}
                    {event.ngay_ket_thuc && ` - ${new Date(event.ngay_ket_thuc).toLocaleDateString('vi-VN')}`}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <strong>Địa điểm:</strong> {event.ten_dia_diem}
                  </div>
                  {event.so_luong_du_kien && (
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      <strong>Số lượng dự kiến:</strong> {event.so_luong_du_kien} người
                    </div>
                  )}
                  {event.trang_thai === 'tu_choi' && event.ly_do_tu_choi && (
                    <div style={{ 
                      marginTop: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm)',
                      background: '#fee2e2',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '4px solid #dc2626'
                    }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: '#991b1b', marginBottom: 'var(--spacing-xs)' }}>
                        ❌ Lý do từ chối:
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: '#7f1d1d', whiteSpace: 'pre-wrap' }}>
                        {event.ly_do_tu_choi}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/organization/events/${event.id_su_kien}`)}
                  >
                    Chi tiết
                  </button>
                </div>
                {event.trang_thai === 'cho_duyet' && (
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => navigate(`/organization/events/${event.id_su_kien}/edit`)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      style={{ flex: 1 }}
                      onClick={() => handleDelete(event.id_su_kien, event.ten_su_kien)}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa sự kiện "${confirmDialog.name}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null, name: '' })}
      />
    </Layout>
  );
};

export default Events;
