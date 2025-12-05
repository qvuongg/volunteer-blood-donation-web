import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const RegistrationList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchRegistrations(eventId);
    } else {
      setRegistrations([]);
      setEventInfo(null);
      setLoadingRegs(false);
    }
  }, [eventId]);

  // Auto-select first event when events are loaded
  useEffect(() => {
    if (!eventId && events.length > 0) {
      setSearchParams({ event: events[0].id_su_kien });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const fetchApprovedEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hospitals/events/approved');
      if (response.data.success) {
        const approvedEvents = response.data.data.events || [];
        setEvents(approvedEvents);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải danh sách sự kiện: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (id) => {
    setLoadingRegs(true);
    try {
      const response = await api.get(`/hospitals/events/${id}/registrations`);
      if (response.data.success) {
        setRegistrations(response.data.data.registrations || []);
        
        // Find event info
        const event = events.find(e => e.id_su_kien === parseInt(id));
        if (event) {
          setEventInfo(event);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải danh sách đăng ký: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleEventChange = (e) => {
    const selectedEventId = e.target.value;
    if (selectedEventId) {
      setSearchParams({ event: selectedEventId });
    } else {
      setSearchParams({});
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
        <h1 className="page-title">Danh sách đăng ký</h1>
        <p className="page-description">
          Xem danh sách người hiến máu đã đăng ký và được tổ chức phê duyệt
        </p>
      </div>

      {/* Event Selector */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Chọn sự kiện</label>
            <select
              className="form-input"
              value={eventId || ''}
              onChange={handleEventChange}
              style={{ maxWidth: '500px' }}
            >
              <option value="">-- Chọn sự kiện --</option>
              {events.map(event => (
                <option key={event.id_su_kien} value={event.id_su_kien}>
                  {event.ten_su_kien} - {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')}
                  {event.ngay_ket_thuc && ` đến ${new Date(event.ngay_ket_thuc).toLocaleDateString('vi-VN')}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!eventId ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <path d="M16 32h32M32 16v32"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Vui lòng chọn sự kiện để xem danh sách đăng ký
            </p>
          </div>
        </div>
      ) : loadingRegs ? (
        <LoadingSpinner />
      ) : (
        <>
          {eventInfo && (
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div className="card-body">
                <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-sm)' }}>{eventInfo.ten_su_kien}</h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  <span>
                    <strong>Ngày:</strong> {new Date(eventInfo.ngay_bat_dau).toLocaleDateString('vi-VN')}
                    {eventInfo.ngay_ket_thuc && ` - ${new Date(eventInfo.ngay_ket_thuc).toLocaleDateString('vi-VN')}`}
                  </span>
                  <span>
                    <strong>Địa điểm:</strong> {eventInfo.ten_dia_diem || eventInfo.dia_chi || 'N/A'}
                  </span>
                  <span>
                    <strong>Tổ chức:</strong> {eventInfo.ten_don_vi || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {registrations.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
                  <path d="M16 32h32M32 16v32"/>
                </svg>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                  Chưa có người đăng ký nào được phê duyệt cho sự kiện này
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Tổng số: <span style={{ color: 'var(--primary-600)' }}>{registrations.length}</span> người
                      </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4 2h8v2H4zM2 6h12v6H2zM4 14h8v-2H4z"/>
                      </svg>
                      In danh sách
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'var(--gray-50)' }}>
                        <tr>
                          <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>STT</th>
                          <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Họ tên</th>
                          <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Email</th>
                          <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Số điện thoại</th>
                          <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Nhóm máu</th>
                          <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Trạng thái xác thực</th>
                          <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Ngày đăng ký</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg, index) => (
                          <tr key={reg.id_dang_ky} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                            <td style={{ padding: 'var(--spacing-md)' }}>{index + 1}</td>
                            <td style={{ padding: 'var(--spacing-md)', fontWeight: 'var(--font-weight-medium)' }}>
                              {reg.ho_ten}
                            </td>
                            <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>{reg.email}</td>
                            <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>{reg.so_dien_thoai || '-'}</td>
                            <td style={{ padding: 'var(--spacing-md)' }}>
                              <span style={{ 
                                fontSize: 'var(--font-size-lg)', 
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--primary-600)'
                              }}>
                                {reg.nhom_mau || '?'}
                              </span>
                            </td>
                            <td style={{ padding: 'var(--spacing-md)' }}>
                              {reg.nhom_mau_xac_nhan ? (
                                <span className="badge badge-success">Đã xác thực</span>
                              ) : (
                                <span className="badge badge-warning">Chưa xác thực</span>
                              )}
                            </td>
                            <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                              {new Date(reg.ngay_dang_ky).toLocaleDateString('vi-VN')}
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
        </>
      )}
    </Layout>
  );
};

export default RegistrationList;
