import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const EventRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventRes, regsRes] = await Promise.all([
        api.get(`/organizations/events/${id}`),
        api.get(`/registrations/event/${id}/list`)
      ]);

      if (eventRes.data.success) {
        setEvent(eventRes.data.data.event);
      }

      if (regsRes.data.success) {
        setRegistrations(regsRes.data.data.registrations || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
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

  const renderPhieuKhamSangLoc = (phieu) => {
    if (!phieu) return <span style={{ color: 'var(--text-secondary)' }}>Chưa có thông tin</span>;

    return (
      <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <strong>1. Đã hiến máu:</strong> {phieu.q1?.hien_mau_chua === 'co' ? '✅ Có' : '❌ Chưa'}
        </div>
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <strong>2. Mắc bệnh hiện tại:</strong> {phieu.q2?.mac_benh === 'co' ? `⚠️ Có (${phieu.q2?.benh_gi || ''})` : '✅ Không'}
        </div>
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <strong>3. Bệnh lý trước đây:</strong> {phieu.q3?.benh_ly_truoc === 'co' ? `⚠️ Có` : '✅ Không'}
          {phieu.q3?.benh_khac && <span> ({phieu.q3.benh_khac})</span>}
        </div>
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <strong>4. Trong 12 tháng:</strong> {phieu.q4?.items?.includes('khong') ? '✅ Không' : `⚠️ ${phieu.q4?.items?.join(', ')}`}
          {phieu.q4?.vacxin && <span> (Vacxin: {phieu.q4.vacxin})</span>}
        </div>
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <strong>5. Trong 6 tháng:</strong> {phieu.q5?.items?.includes('khong') ? '✅ Không' : '⚠️ Có'}
        </div>
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <strong>6. Trong 1 tháng:</strong> {phieu.q6?.items?.includes('khong') ? '✅ Không' : '⚠️ Có'}
        </div>
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <strong>7. Trong 14 ngày:</strong> {phieu.q7?.mac_benh === 'khong' ? '✅ Không' : `⚠️ Có`}
          {phieu.q7?.khac && <span> ({phieu.q7.khac})</span>}
        </div>
        <div>
          <strong>8. Trong 7 ngày:</strong> {phieu.q8?.dung_thuoc === 'khong' ? '✅ Không' : `⚠️ Có`}
          {phieu.q8?.khac && <span> ({phieu.q8.khac})</span>}
        </div>
      </div>
    );
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
          <h1 className="page-title">Danh sách đăng ký</h1>
          <p className="page-description">
            {event ? `Sự kiện: ${event.ten_su_kien}` : 'Đang tải...'}
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => navigate(`/organization/events/${id}`)}
        >
          Quay lại
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
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

      {filteredRegistrations.length === 0 ? (
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
                {/* Header */}
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

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 'var(--spacing-2xl)' }}>
                  {/* Thông tin cơ bản */}
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

                  {/* Phiếu khám sàng lọc - Trái */}
                  <div>
                    <h4 style={{ 
                      fontSize: 'var(--font-size-md)', 
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-md)',
                      color: '#dc2626'
                    }}>
                      Phiếu sàng lọc (1/2)
                    </h4>
                    {reg.phieu_kham_sang_loc && (
                      <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                          <strong>1. Đã hiến máu:</strong><br/>
                          {reg.phieu_kham_sang_loc.q1?.hien_mau_chua === 'co' ? '✅ Có' : '❌ Chưa'}
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                          <strong>2. Mắc bệnh hiện tại:</strong><br/>
                          {reg.phieu_kham_sang_loc.q2?.mac_benh === 'co' 
                            ? `⚠️ Có: ${reg.phieu_kham_sang_loc.q2?.benh_gi || ''}` 
                            : '✅ Không'}
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                          <strong>3. Bệnh lý trước:</strong><br/>
                          {reg.phieu_kham_sang_loc.q3?.benh_ly_truoc === 'co' ? `⚠️ Có` : '✅ Không'}
                          {reg.phieu_kham_sang_loc.q3?.benh_khac && <span><br/>({reg.phieu_kham_sang_loc.q3.benh_khac})</span>}
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                          <strong>4. Trong 12 tháng:</strong><br/>
                          {reg.phieu_kham_sang_loc.q4?.items?.includes('Không') ? (
                            '✅ Không'
                          ) : (
                            <div>
                              ⚠️ Có:
                              <ul style={{ margin: '2px 0', paddingLeft: '16px' }}>
                                {reg.phieu_kham_sang_loc.q4?.items?.filter(item => item !== 'Không').map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                              {reg.phieu_kham_sang_loc.q4?.vacxin && <span>Vacxin: {reg.phieu_kham_sang_loc.q4.vacxin}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phiếu khám sàng lọc - Phải */}
                  <div>
                    <h4 style={{ 
                      fontSize: 'var(--font-size-md)', 
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--spacing-md)',
                      color: '#dc2626'
                    }}>
                      Phiếu sàng lọc (2/2)
                    </h4>
                    {reg.phieu_kham_sang_loc && (
                      <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                          <strong>5. Trong 6 tháng:</strong><br/>
                          {reg.phieu_kham_sang_loc.q5?.items?.includes('Không') ? (
                            '✅ Không'
                          ) : (
                            <div>
                              ⚠️ Có:
                              <ul style={{ margin: '2px 0', paddingLeft: '16px' }}>
                                {reg.phieu_kham_sang_loc.q5?.items?.filter(item => item !== 'Không').map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                          <strong>6. Trong 1 tháng:</strong><br/>
                          {reg.phieu_kham_sang_loc.q6?.items?.includes('Không') ? (
                            '✅ Không'
                          ) : (
                            <div>
                              ⚠️ Có:
                              <ul style={{ margin: '2px 0', paddingLeft: '16px' }}>
                                {reg.phieu_kham_sang_loc.q6?.items?.filter(item => item !== 'Không').map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                          <strong>7. Trong 14 ngày:</strong><br/>
                          {reg.phieu_kham_sang_loc.q7?.mac_benh === 'Không' ? (
                            '✅ Không'
                          ) : (
                            <div>
                              ⚠️ {reg.phieu_kham_sang_loc.q7?.mac_benh}
                              {reg.phieu_kham_sang_loc.q7?.khac && <span><br/>Chi tiết: {reg.phieu_kham_sang_loc.q7.khac}</span>}
                            </div>
                          )}
                        </div>
                        <div>
                          <strong>8. Trong 7 ngày:</strong><br/>
                          {reg.phieu_kham_sang_loc.q8?.dung_thuoc === 'Không' ? (
                            '✅ Không'
                          ) : (
                            <div>
                              ⚠️ {reg.phieu_kham_sang_loc.q8?.dung_thuoc}
                              {reg.phieu_kham_sang_loc.q8?.khac && <span><br/>Chi tiết: {reg.phieu_kham_sang_loc.q8.khac}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ghi chú duyệt */}
                {reg.ghi_chu_duyet && (
                  <div style={{ 
                    marginTop: 'var(--spacing-lg)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid #dc2626'
                  }}>
                    <strong>Ghi chú:</strong> {reg.ghi_chu_duyet}
                  </div>
                )}

                {/* Actions */}
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-md)', 
                  marginTop: 'var(--spacing-lg)',
                  paddingTop: 'var(--spacing-lg)',
                  borderTop: '1px solid var(--gray-200)'
                }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/organization/events/${id}/registrations/${reg.id_dang_ky}`)}
                    style={{ flex: 1 }}
                  >
                    {reg.trang_thai === 'cho_duyet' ? '📋 Xem chi tiết & Duyệt' : '📋 Xem chi tiết'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default EventRegistrations;
