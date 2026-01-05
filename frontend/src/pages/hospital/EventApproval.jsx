import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import InputDialog from '../../components/InputDialog';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const EventApproval = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, eventId: null, eventName: '' });
  const [rejectDialog, setRejectDialog] = useState({ isOpen: false, eventId: null });
  const { showToast } = useToast();

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const response = await api.get('/hospitals/events/all');
      if (response.data.success) {
        setEvents(response.data.data.events || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const handleApprove = (eventId, eventName) => {
    setConfirmDialog({ isOpen: true, eventId, eventName });
  };

  const confirmApprove = async () => {
    const { eventId } = confirmDialog;
    setConfirmDialog({ isOpen: false, eventId: null, eventName: '' });

    setProcessing(eventId);
    try {
      const response = await api.put(`/hospitals/events/${eventId}/status`, {
        trang_thai: 'da_duyet'
      });

      if (response.data.success) {
        showToast('Phê duyệt sự kiện thành công!', 'success');
        setShowDetailModal(false);
        setSelectedEvent(null);
        fetchAllEvents(); // Refresh to show updated status
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (eventId) => {
    setRejectDialog({ isOpen: true, eventId });
  };

  const confirmReject = async (reason) => {
    const { eventId } = rejectDialog;
    setRejectDialog({ isOpen: false, eventId: null });

    setProcessing(eventId);
    try {
      const response = await api.put(`/hospitals/events/${eventId}/status`, {
        trang_thai: 'tu_choi',
        ly_do: reason
      });

      if (response.data.success) {
        showToast('Đã từ chối sự kiện.', 'success');
        setShowDetailModal(false);
        setSelectedEvent(null);
        fetchAllEvents(); // Refresh to show updated status
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (trang_thai) => {
    switch (trang_thai) {
      case 'cho_duyet':
        return <span className="badge badge-warning">Chờ duyệt</span>;
      case 'da_duyet':
        return <span className="badge badge-success">Đã duyệt</span>;
      case 'tu_choi':
        return <span className="badge badge-danger">Đã từ chối</span>;
      default:
        return <span className="badge badge-secondary">{trang_thai}</span>;
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.trang_thai === filter;
  });

  const sortedEvents = filteredEvents.sort((a, b) => {
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
    
    // Trong cùng nhóm, sắp xếp theo ngày bắt đầu (mới nhất trước)
    const dateA = new Date(a.ngay_bat_dau);
    const dateB = new Date(b.ngay_bat_dau);
    return dateB - dateA;
  });

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
        <h1 className="page-title">Phê duyệt sự kiện</h1>
        <p className="page-description">
          Danh sách tất cả sự kiện hiến máu (chờ duyệt, đã duyệt, đã từ chối)
        </p>
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
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <path d="M16 8h32M16 56h32M48 8v48M16 8v48M24 20h16M24 32h16M24 44h16"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Không có sự kiện nào
            </p>
          </div>
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Không có sự kiện nào phù hợp với bộ lọc
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {sortedEvents.map(event => (
            <div key={event.id_su_kien} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{event.ten_su_kien}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', alignItems: 'flex-end' }}>
                    {getStatusBadge(event.trang_thai)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <strong>Tổ chức:</strong> {event.ten_don_vi}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <strong>Ngày:</strong> {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')}
                    {event.ngay_ket_thuc && ` - ${new Date(event.ngay_ket_thuc).toLocaleDateString('vi-VN')}`}
                  </div>
                  {event.ten_dia_diem && (
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      <strong>Địa điểm:</strong> {event.ten_dia_diem}
                    </div>
                  )}
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
                      <div style={{ fontSize: 'var(--font-size-sm)', color: '#7f1d1d', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                        {event.ly_do_tu_choi.length > 100 ? `${event.ly_do_tu_choi.substring(0, 100)}...` : event.ly_do_tu_choi}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => openDetailModal(event)}
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div 
          onClick={() => setShowDetailModal(false)}
          style={{
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
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-2xl)',
              maxWidth: '1000px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
              <h2 style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                margin: 0
              }}>
                {selectedEvent.ten_su_kien}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 'var(--spacing-xs)',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
              <div>
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Trạng thái
                  </div>
                  {getStatusBadge(selectedEvent.trang_thai)}
                </div>

                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Tổ chức
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {selectedEvent.ten_don_vi}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Ngày bắt đầu
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {new Date(selectedEvent.ngay_bat_dau).toLocaleDateString('vi-VN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                {selectedEvent.ngay_ket_thuc && (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                      Ngày kết thúc
                    </div>
                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      {new Date(selectedEvent.ngay_ket_thuc).toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                )}

                {selectedEvent.so_luong_du_kien && (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                      Số lượng dự kiến
                    </div>
                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      {selectedEvent.so_luong_du_kien} người
                    </div>
                  </div>
                )}
              </div>

              <div>
                {selectedEvent.ten_dia_diem && (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                      Tên địa điểm
                    </div>
                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      {selectedEvent.ten_dia_diem}
                    </div>
                  </div>
                )}

                {selectedEvent.dia_chi && (
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                      Địa chỉ
                    </div>
                    <div style={{ fontSize: 'var(--font-size-base)' }}>
                      {selectedEvent.dia_chi}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.dia_chi)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-block', 
                        marginTop: 'var(--spacing-sm)', 
                        color: 'var(--primary-600)',
                        textDecoration: 'none'
                      }}
                    >
                      Xem trên Google Maps →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {selectedEvent.trang_thai === 'tu_choi' && selectedEvent.ly_do_tu_choi && (
              <div style={{ 
                marginTop: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                background: '#fee2e2',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid #dc2626'
              }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: '#991b1b', marginBottom: 'var(--spacing-sm)' }}>
                  ❌ Lý do từ chối:
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', color: '#7f1d1d', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {selectedEvent.ly_do_tu_choi}
                </div>
              </div>
            )}

            {selectedEvent.trang_thai === 'cho_duyet' && (
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-xl)',
                paddingTop: 'var(--spacing-lg)',
                borderTop: '1px solid var(--gray-200)',
                justifyContent: 'flex-end'
              }}>
                <button
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedEvent.id_su_kien, selectedEvent.ten_su_kien)}
                  disabled={processing === selectedEvent.id_su_kien}
                >
                  {processing === selectedEvent.id_su_kien ? (
                    <>
                      <LoadingSpinner size="small" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6 9l2 2 4-4"/>
                      </svg>
                      Phê duyệt
                    </>
                  )}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleReject(selectedEvent.id_su_kien)}
                  disabled={processing === selectedEvent.id_su_kien}
                >
                  Từ chối
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận phê duyệt"
        message={`Bạn có chắc muốn phê duyệt sự kiện "${confirmDialog.eventName}"?`}
        onConfirm={confirmApprove}
        onCancel={() => setConfirmDialog({ isOpen: false, eventId: null, eventName: '' })}
      />

      <InputDialog
        isOpen={rejectDialog.isOpen}
        title="Từ chối sự kiện"
        message="Vui lòng nhập lý do từ chối:"
        placeholder="Lý do từ chối..."
        onConfirm={confirmReject}
        onCancel={() => setRejectDialog({ isOpen: false, eventId: null })}
      />
    </Layout>
  );
};

export default EventApproval;

