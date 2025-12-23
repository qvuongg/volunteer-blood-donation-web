import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const ResultUpdate = () => {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [bulkFormData, setBulkFormData] = useState({
    ngay_hien: new Date().toISOString().split('T')[0],
    luong_ml: '350',
    ket_qua: 'Dat'
  });

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchRegistrations(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchApprovedEvents = async () => {
    try {
      const response = await api.get('/hospitals/events/approved');
      if (response.data.success) {
        setEvents(response.data.data.events || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId) => {
    setLoadingRegs(true);
    setSelectedDonors([]);
    try {
      const response = await api.get(`/hospitals/events/${eventId}/registrations`);
      if (response.data.success) {
        const regs = response.data.data.registrations || [];
        setRegistrations(regs);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách đăng ký');
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    const event = events.find(ev => ev.id_su_kien === parseInt(eventId));
    setSelectedEvent(event);
    if (eventId) {
      fetchRegistrations(eventId);
    } else {
      setRegistrations([]);
      setSelectedDonors([]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Only select donors who don't have results yet
      const availableDonors = registrations
        .filter(r => !r.da_co_ket_qua)
        .map(r => r.id_nguoi_hien);
      setSelectedDonors(availableDonors);
    } else {
      setSelectedDonors([]);
    }
  };

  const handleSelectDonor = (id) => {
    setSelectedDonors(prev => {
      if (prev.includes(id)) {
        return prev.filter(donorId => donorId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleBulkChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedDonors.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người hiến máu');
      return;
    }

    if (!bulkFormData.ngay_hien || !bulkFormData.luong_ml || !bulkFormData.ket_qua) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate donation date
    const donationDate = new Date(bulkFormData.ngay_hien);
    const eventStartDate = new Date(selectedEvent.ngay_bat_dau);

    if (donationDate < eventStartDate) {
      toast.error('Ngày hiến không thể trước ngày bắt đầu sự kiện');
      return;
    }

    setShowConfirmModal(true);
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.ngay_bat_dau);
    const end = new Date(event.ngay_ket_thuc);
    
    if (now < start) return { text: 'Sắp diễn ra', class: 'badge-info' };
    if (now > end) return { text: 'Đã kết thúc', class: 'badge-secondary' };
    return { text: 'Đang diễn ra', class: 'badge-success' };
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
        <h1 className="page-title">Cập nhật kết quả hiến máu</h1>
        <p className="page-description">
          Ghi nhận kết quả hiến máu của người tham gia
        </p>
      </div>

      {/* Event Selection */}
      <div className="card">
        <div className="card-body">
            <div className="form-group">
            <label className="form-label">Chọn sự kiện *</label>
              <select
              className="form-input"
              value={selectedEvent?.id_su_kien || ''}
              onChange={handleEventChange}
              >
                <option value="">-- Chọn sự kiện --</option>
              {events.map(event => {
                const status = getEventStatus(event);
                return (
                  <option key={event.id_su_kien} value={event.id_su_kien}>
                    {event.ten_su_kien} - {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')} ({status.text})
                  </option>
                );
              })}
              </select>
              <small style={{ display: 'block', marginTop: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>
                Chỉ hiển thị các sự kiện đã được phê duyệt
              </small>
            </div>

          {selectedEvent && (
            <div style={{ 
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)', 
              background: 'var(--gray-50)', 
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{selectedEvent.ten_su_kien}</strong>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                    {new Date(selectedEvent.ngay_bat_dau).toLocaleDateString('vi-VN')} - {new Date(selectedEvent.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <span className={`badge ${getEventStatus(selectedEvent).class}`}>
                  {getEventStatus(selectedEvent).text}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registrations List */}
            {selectedEvent && (
              <>
                {loadingRegs ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                    <LoadingSpinner />
              </div>
            </div>
          ) : registrations.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Không có đăng ký nào được duyệt cho sự kiện này
                </p>
              </div>
                  </div>
                ) : (
                  <>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Danh sách người hiến ({registrations.length})</h3>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Đã chọn: {selectedDonors.length} / {registrations.filter(r => !r.da_co_ket_qua).length} người chưa có kết quả
                  </div>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>
                            <input
                              type="checkbox"
                              checked={
                                registrations.filter(r => !r.da_co_ket_qua).length > 0 &&
                                selectedDonors.length === registrations.filter(r => !r.da_co_ket_qua).length
                              }
                              onChange={handleSelectAll}
                            />
                          </th>
                          <th>Họ tên</th>
                          <th>Email</th>
                          <th>SĐT</th>
                          <th>Nhóm máu</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map(reg => (
                          <tr 
                            key={reg.id_dang_ky}
                            style={{ 
                              opacity: reg.da_co_ket_qua ? 0.6 : 1,
                              background: reg.da_co_ket_qua ? 'var(--gray-50)' : 'transparent'
                            }}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedDonors.includes(reg.id_nguoi_hien)}
                                onChange={() => handleSelectDonor(reg.id_nguoi_hien)}
                                disabled={reg.da_co_ket_qua}
                              />
                            </td>
                            <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                              {reg.ho_ten}
                              {reg.da_co_ket_qua && (
                                <span style={{ marginLeft: 'var(--spacing-xs)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                  (Đã có kết quả)
                                </span>
                              )}
                            </td>
                            <td style={{ fontSize: 'var(--font-size-sm)' }}>{reg.email}</td>
                            <td style={{ fontSize: 'var(--font-size-sm)' }}>{reg.so_dien_thoai || '-'}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                <span className="badge badge-danger">{reg.nhom_mau || '?'}</span>
                                {reg.nhom_mau_xac_nhan ? (
                                  <span className="badge badge-success" style={{ fontSize: 'var(--font-size-xs)' }}>
                                    ✓ Đã xác thực
                                  </span>
                                ) : (
                                  <span className="badge badge-warning" style={{ fontSize: 'var(--font-size-xs)' }}>
                                    Chưa xác thực
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              {reg.da_co_ket_qua ? (
                                <span className="badge badge-info">Đã cập nhật kết quả</span>
                              ) : (
                                <span className="badge badge-success">Đã duyệt</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bulk Update Form */}
              {selectedDonors.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Cập nhật kết quả ({selectedDonors.length} người)</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleBulkSubmit}>
                      <div className="alert alert-info" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        ℹ️ Thông tin này sẽ được áp dụng cho tất cả {selectedDonors.length} người đã chọn
                    </div>

                      <div className="grid grid-cols-3">
                      <div className="form-group">
                        <label className="form-label">Ngày hiến *</label>
                        <input
                          type="date"
                          name="ngay_hien"
                            className="form-input"
                            value={bulkFormData.ngay_hien}
                            onChange={handleBulkChange}
                            min={selectedEvent.ngay_bat_dau}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Lượng máu (ml) *</label>
                          <select
                          name="luong_ml"
                            className="form-input"
                            value={bulkFormData.luong_ml}
                            onChange={handleBulkChange}
                          required
                          >
                            <option value="250">250 ml</option>
                            <option value="350">350 ml</option>
                            <option value="450">450 ml</option>
                          </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Kết quả *</label>
                      <select
                        name="ket_qua"
                            className="form-input"
                            value={bulkFormData.ket_qua}
                            onChange={handleBulkChange}
                        required
                      >
                        <option value="Dat">Đạt</option>
                        <option value="Khong dat">Không đạt</option>
                        <option value="Can xem xet">Cần xem xét</option>
                      </select>
                        </div>
                    </div>

                    <div style={{ 
                      padding: 'var(--spacing-lg)', 
                        background: 'var(--warning-50)', 
                      borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        border: '1px solid var(--warning-200)'
                    }}>
                        <h4 style={{ marginTop: 0, fontSize: 'var(--font-size-base)', color: 'var(--warning-700)' }}>
                          ⚠️ Lưu ý quan trọng
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                        <li>Kiểm tra kỹ thông tin trước khi lưu</li>
                        <li>Kết quả "Đạt" sẽ tăng số lần hiến máu của người tham gia</li>
                          <li>Không thể cập nhật kết quả cho người đã có kết quả trong sự kiện này</li>
                          <li>Sau khi lưu, hãy xác thực nhóm máu cho người chưa xác thực</li>
                      </ul>
                    </div>

                      <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setSelectedDonors([])}
                          disabled={saving}
                        >
                          Bỏ chọn tất cả
                        </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <LoadingSpinner size="small" />
                            Đang lưu...
                          </>
                        ) : (
                            `Lưu kết quả (${selectedDonors.length})`
                        )}
                      </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {showConfirmModal && (
        <div
          onClick={() => setShowConfirmModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500,
            padding: 'var(--spacing-lg)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-2xl)',
              maxWidth: '480px',
              width: '100%'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-md)' }}>Xác nhận lưu kết quả</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Bạn chắc chắn muốn cập nhật kết quả cho <strong>{selectedDonors.length}</strong> người hiến máu?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  setSaving(true);
                  try {
                    const results = selectedDonors.map(id_nguoi_hien => ({
                      id_nguoi_hien,
                      luong_ml: bulkFormData.luong_ml,
                      ket_qua: bulkFormData.ket_qua
                    }));
      
                    const response = await api.post('/hospitals/results/bulk', {
                      id_su_kien: selectedEvent.id_su_kien,
                      ngay_hien: bulkFormData.ngay_hien,
                      results
                    });
      
                    if (response.data.success) {
                      toast.success(response.data.message);
                      setSelectedDonors([]);
                      setBulkFormData({
                            ngay_hien: new Date().toISOString().split('T')[0],
                        luong_ml: '350',
                            ket_qua: 'Dat'
                          });
                      fetchRegistrations(selectedEvent.id_su_kien);
                    }
                  } catch (error) {
                    toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
                  } finally {
                    setSaving(false);
                    setShowConfirmModal(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Xác nhận'}
                      </button>
                    </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ResultUpdate;

