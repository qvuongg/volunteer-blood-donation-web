import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const OrganizationRegistrationList = () => {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    trang_thai: '',
    ly_do_mau: [],
    ghi_chu_duyet: ''
  });

  const lyDoMau = [
    'Đủ điều kiện sức khỏe',
    'Thông tin đầy đủ và chính xác',
    'Đã xác minh danh tính',
    'Phù hợp với yêu cầu sự kiện'
  ];

  const lyDoTuChoi = [
    'Không đủ điều kiện sức khỏe',
    'Đã hiến máu gần đây',
    'Thông tin không chính xác',
    'Có bệnh lý không phù hợp',
    'Khác (ghi rõ bên dưới)'
  ];

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const eventsRes = await api.get('/organizations/events');
        if (eventsRes.data.success) {
          const list = eventsRes.data.data.events || [];
          setEvents(list);
          if (list.length > 0) {
            const firstId = list[0].id_su_kien;
            setSelectedEventId(String(firstId));
            await fetchEventAndRegistrations(firstId);
          }
        }
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách sự kiện');
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEventAndRegistrations = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const [eventRes, regsRes] = await Promise.all([
        api.get(`/organizations/events/${eventId}`),
        api.get(`/registrations/event/${eventId}/list`)
      ]);

      if (eventRes.data.success) {
        setEvent(eventRes.data.data.event);
      }

      if (regsRes.data.success) {
        setRegistrations(regsRes.data.data.registrations || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEvent = async (e) => {
    const newId = e.target.value;
    setSelectedEventId(newId);
    if (newId) {
      await fetchEventAndRegistrations(newId);
    }
  };

  const openApprovalModal = (registration, status) => {
    setSelectedRegistration(registration);
    setApprovalData({
      trang_thai: status,
      ly_do_mau: [],
      ghi_chu_duyet: ''
    });
    setShowApprovalModal(true);
  };

  const handleApproval = async () => {
    try {
      const ghiChu = approvalData.ly_do_mau.length > 0
        ? approvalData.ly_do_mau.join(', ') + (approvalData.ghi_chu_duyet ? `. ${approvalData.ghi_chu_duyet}` : '')
        : approvalData.ghi_chu_duyet;

      const response = await api.put(`/registrations/${selectedRegistration.id_dang_ky}/status`, {
        trang_thai: approvalData.trang_thai,
        ghi_chu_duyet: ghiChu
      });

      if (response.data.success) {
        if (approvalData.trang_thai === 'da_duyet') {
          toast.success('Đã duyệt đăng ký thành công');
        } else {
          toast.success('Đã từ chối đăng ký');
        }
        setShowApprovalModal(false);
        if (selectedEventId) {
          fetchEventAndRegistrations(selectedEventId);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const toggleLyDoMau = (lyDo) => {
    const newLyDoMau = approvalData.ly_do_mau.includes(lyDo)
      ? approvalData.ly_do_mau.filter(item => item !== lyDo)
      : [...approvalData.ly_do_mau, lyDo];
    setApprovalData({ ...approvalData, ly_do_mau: newLyDoMau });
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
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Danh sách đăng ký</h1>
          <p className="page-description">
            Chọn sự kiện để xem và duyệt các đăng ký hiến máu
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', alignItems: 'center' }}>
          <div style={{ minWidth: '260px' }}>
            <label className="form-label" style={{ marginBottom: 'var(--spacing-xs)' }}>
              Sự kiện
            </label>
            <select
              className="form-input"
              value={selectedEventId}
              onChange={handleChangeEvent}
            >
              {events.length === 0 && <option value="">Chưa có sự kiện nào</option>}
              {events.length > 0 && !selectedEventId && <option value="">Chọn sự kiện</option>}
              {events.map(ev => (
                <option key={ev.id_su_kien} value={ev.id_su_kien}>
                  {ev.ten_su_kien}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <label className="form-label" style={{ marginBottom: 'var(--spacing-xs)' }}>
              Bộ lọc trạng thái
            </label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
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
      </div>

      {event && (
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Đang xem đăng ký cho sự kiện: <strong>{event.ten_su_kien}</strong>
          </p>
        </div>
      )}

      {!selectedEventId ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Vui lòng chọn một sự kiện để xem danh sách đăng ký.
            </p>
          </div>
        </div>
      ) : filteredRegistrations.length === 0 ? (
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {filteredRegistrations.map((reg, index) => (
            <div key={reg.id_dang_ky} className="card">
              <div className="card-body">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--spacing-lg)',
                  paddingBottom: 'var(--spacing-md)',
                  borderBottom: '1px solid var(--gray-200)'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: 'var(--font-weight-bold)',
                      marginBottom: 'var(--spacing-xs)'
                    }}>
                      #{index + 1} - {reg.ho_ten}
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      <span>📧 {reg.email}</span>
                      {reg.so_dien_thoai && <span>📞 {reg.so_dien_thoai}</span>}
                      <span>👤 {reg.gioi_tinh}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {getStatusBadge(reg.trang_thai)}
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Đăng ký: {new Date(reg.ngay_dang_ky).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2xl)' }}>
                  <div>
                    <h4 style={{
                      fontSize: 'var(--font-size-md)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-md)',
                      color: '#dc2626'
                    }}>
                      Thông tin cơ bản
                    </h4>
                    <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 2 }}>
                      <div><strong>Ngày hẹn:</strong> {reg.ngay_hen_hien ? new Date(reg.ngay_hen_hien).toLocaleDateString('vi-VN') : 'Chưa có'}</div>
                      <div><strong>Khung giờ:</strong> {reg.khung_gio || 'Chưa có'}</div>
                      <div><strong>Nhóm máu:</strong> <span className="badge badge-danger" style={{ fontSize: 'var(--font-size-md)' }}>{reg.nhom_mau || '?'}</span></div>
                      <div><strong>Đã hiến:</strong> {reg.tong_so_lan_hien || 0} lần</div>
                      {reg.lan_hien_gan_nhat && (
                        <div><strong>Lần gần nhất:</strong> {new Date(reg.lan_hien_gan_nhat).toLocaleDateString('vi-VN')}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 style={{
                      fontSize: 'var(--font-size-md)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-md)',
                      color: '#dc2626'
                    }}>
                      Ghi chú duyệt
                    </h4>
                    {reg.ghi_chu_duyet ? (
                      <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid #dc2626',
                        fontSize: 'var(--font-size-sm)'
                      }}>
                        {reg.ghi_chu_duyet}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        Chưa có ghi chú duyệt.
                      </p>
                    )}
                  </div>
                </div>

                {reg.trang_thai === 'cho_duyet' && (
                  <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    marginTop: 'var(--spacing-lg)',
                    paddingTop: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--gray-200)'
                  }}>
                    <button
                      className="btn btn-success"
                      onClick={() => openApprovalModal(reg, 'da_duyet')}
                    >
                      ✅ Duyệt đăng ký
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => openApprovalModal(reg, 'tu_choi')}
                    >
                      ❌ Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showApprovalModal && selectedRegistration && (
        <div 
          onClick={() => setShowApprovalModal(false)}
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
            zIndex: 1000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-2xl)',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--spacing-lg)',
              color: approvalData.trang_thai === 'da_duyet' ? '#16a34a' : '#dc2626'
            }}>
              {approvalData.trang_thai === 'da_duyet' ? '✅ Duyệt đăng ký' : '❌ Từ chối đăng ký'}
            </h2>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <strong>Người hiến:</strong> {selectedRegistration.ho_ten}
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{
                display: 'block',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-sm)'
              }}>
                {approvalData.trang_thai === 'da_duyet' ? 'Lý do duyệt (chọn nhiều):' : 'Lý do từ chối (chọn nhiều):'}
              </label>
              {(approvalData.trang_thai === 'da_duyet' ? lyDoMau : lyDoTuChoi).map((lyDo, idx) => (
                <label
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: 'var(--spacing-sm)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    background: approvalData.ly_do_mau.includes(lyDo) ? 'var(--gray-100)' : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={approvalData.ly_do_mau.includes(lyDo)}
                    onChange={() => toggleLyDoMau(lyDo)}
                  />
                  <span>{lyDo}</span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                Ghi chú thêm:
              </label>
              <textarea
                className="form-input"
                rows="4"
                value={approvalData.ghi_chu_duyet}
                onChange={(e) => setApprovalData({ ...approvalData, ghi_chu_duyet: e.target.value })}
                placeholder="Nhập ghi chú thêm (nếu có)..."
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowApprovalModal(false)}
              >
                Hủy
              </button>
              <button
                className={`btn ${approvalData.trang_thai === 'da_duyet' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleApproval}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default OrganizationRegistrationList;

