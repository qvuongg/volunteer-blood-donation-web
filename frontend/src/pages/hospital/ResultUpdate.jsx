import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const ResultUpdate = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id_nguoi_hien: '',
    id_su_kien: '',
    ngay_hien: new Date().toISOString().split('T')[0],
    luong_ml: '',
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
      // TODO: Create API endpoint to get approved events
      // For now, use placeholder
      setEvents([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId) => {
    setLoadingRegs(true);
    try {
      const response = await api.get(`/hospitals/events/${eventId}/registrations`);
      if (response.data.success) {
        setRegistrations(response.data.data.registrations || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.id_nguoi_hien || !formData.luong_ml) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/hospitals/results', {
        ...formData,
        id_su_kien: selectedEvent
      });

      if (response.data.success) {
        alert('Cập nhật kết quả thành công!');
        // Reset form
        setFormData({
          id_nguoi_hien: '',
          id_su_kien: '',
          ngay_hien: new Date().toISOString().split('T')[0],
          luong_ml: '',
          ket_qua: 'Dat'
        });
        // Refresh registrations
        fetchRegistrations(selectedEvent);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
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
        <h1 className="page-title">Cập nhật kết quả hiến máu</h1>
        <p className="page-description">
          Ghi nhận kết quả hiến máu của người tham gia
        </p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Sự kiện *</label>
              <select
                className="form-control"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                required
              >
                <option value="">-- Chọn sự kiện --</option>
                {events.map(event => (
                  <option key={event.id_su_kien} value={event.id_su_kien}>
                    {event.ten_su_kien} - {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')}
                  </option>
                ))}
              </select>
              <small style={{ display: 'block', marginTop: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>
                Chỉ hiển thị các sự kiện đã được phê duyệt
              </small>
            </div>

            {selectedEvent && (
              <>
                {loadingRegs ? (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Người hiến máu *</label>
                      <select
                        name="id_nguoi_hien"
                        className="form-control"
                        value={formData.id_nguoi_hien}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Chọn người hiến máu --</option>
                        {registrations.map(reg => (
                          <option key={reg.id_dang_ky} value={reg.id_nguoi_hien}>
                            {reg.ho_ten} - {reg.nhom_mau || '?'} - {reg.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2">
                      <div className="form-group">
                        <label className="form-label">Ngày hiến *</label>
                        <input
                          type="date"
                          name="ngay_hien"
                          className="form-control"
                          value={formData.ngay_hien}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Lượng máu (ml) *</label>
                        <input
                          type="number"
                          name="luong_ml"
                          className="form-control"
                          value={formData.luong_ml}
                          onChange={handleChange}
                          placeholder="Ví dụ: 350, 450"
                          min="200"
                          max="500"
                          step="50"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Kết quả *</label>
                      <select
                        name="ket_qua"
                        className="form-control"
                        value={formData.ket_qua}
                        onChange={handleChange}
                        required
                      >
                        <option value="Dat">Đạt</option>
                        <option value="Khong dat">Không đạt</option>
                        <option value="Can xem xet">Cần xem xét</option>
                      </select>
                    </div>

                    <div style={{ 
                      padding: 'var(--spacing-lg)', 
                      background: 'var(--primary-50)', 
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-lg)'
                    }}>
                      <h4 style={{ marginTop: 0, fontSize: 'var(--font-size-base)', color: 'var(--primary-700)' }}>
                        💡 Lưu ý quan trọng
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                        <li>Kiểm tra kỹ thông tin trước khi lưu</li>
                        <li>Lượng máu thông thường: 350ml hoặc 450ml</li>
                        <li>Kết quả "Đạt" sẽ tăng số lần hiến máu của người tham gia</li>
                        <li>Sau khi lưu, hãy xác thực nhóm máu nếu chưa được xác thực</li>
                      </ul>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
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
                          'Lưu kết quả'
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setFormData({
                            id_nguoi_hien: '',
                            id_su_kien: '',
                            ngay_hien: new Date().toISOString().split('T')[0],
                            luong_ml: '',
                            ket_qua: 'Dat'
                          });
                        }}
                      >
                        Làm mới
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResultUpdate;

