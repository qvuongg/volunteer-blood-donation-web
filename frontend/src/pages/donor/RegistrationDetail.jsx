import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const RegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRegistrationDetail();
  }, [id]);

  const fetchRegistrationDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get('/registrations/my');
      if (response.data.success) {
        const reg = response.data.data.registrations.find(r => r.id_dang_ky === parseInt(id));
        if (reg) {
          // Parse JSON if needed
          if (typeof reg.phieu_kham_sang_loc === 'string') {
            reg.phieu_kham_sang_loc = JSON.parse(reg.phieu_kham_sang_loc);
          }
          setRegistration(reg);
        } else {
          toast.error('Không tìm thấy đơn đăng ký');
          navigate('/donor/registrations');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn đăng ký này? Hành động này không thể hoàn tác.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await api.delete(`/registrations/${id}`);
      if (response.data.success) {
        toast.success('Đã xóa đơn đăng ký thành công');
        navigate('/donor/registrations');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa đơn');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'da_duyet': { label: 'Đã duyệt', class: 'badge-success', icon: '✅' },
      'cho_duyet': { label: 'Chờ duyệt', class: 'badge-warning', icon: '⏳' },
      'tu_choi': { label: 'Từ chối', class: 'badge-danger', icon: '❌' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'badge-gray', icon: '❓' };
    return (
      <span className={`badge ${statusInfo.class}`} style={{ fontSize: 'var(--font-size-lg)' }}>
        {statusInfo.icon} {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  if (!registration) {
    return (
      <Layout>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Không tìm thấy đơn đăng ký
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/donor/registrations')}>
              Quay lại danh sách
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const phieu = registration.phieu_kham_sang_loc;

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Chi tiết đơn đăng ký hiến máu</h1>
          <p className="page-description">
            Mã đơn: #{registration.id_dang_ky}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button className="btn btn-outline" onClick={() => navigate('/donor/registrations')}>
            Quay lại
          </button>
          {registration.trang_thai === 'cho_duyet' && (
            <button 
              className="btn btn-danger" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : '🗑️ Xóa đơn'}
            </button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)', background: registration.trang_thai === 'cho_duyet' ? '#fffbeb' : 'white' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
                {getStatusBadge(registration.trang_thai)}
              </h2>
              {registration.trang_thai === 'cho_duyet' && (
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                  Đơn đăng ký của bạn đang chờ người phụ trách tổ chức xem xét và duyệt.
                </p>
              )}
              {registration.trang_thai === 'da_duyet' && (
                <p style={{ color: '#16a34a', marginTop: 'var(--spacing-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  🎉 Chúc mừng! Đơn của bạn đã được duyệt. Vui lòng đến đúng giờ hẹn.
                </p>
              )}
              {registration.trang_thai === 'tu_choi' && registration.ghi_chu_duyet && (
                <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: '#fee2e2', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #dc2626' }}>
                  <strong>Lý do từ chối:</strong>
                  <p style={{ marginTop: '4px' }}>{registration.ghi_chu_duyet}</p>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Đăng ký lúc
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                {new Date(registration.ngay_dang_ky).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Info */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: '#dc2626' }}>
            📍 Thông tin sự kiện
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Tên sự kiện</div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {registration.ten_su_kien}
                </div>
              </div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Địa điểm</div>
                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{registration.ten_dia_diem}</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{registration.dia_chi}</div>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Ngày hẹn hiến máu</div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: '#dc2626' }}>
                  📅 {registration.ngay_hen_hien ? new Date(registration.ngay_hen_hien).toLocaleDateString('vi-VN') : 'Chưa có'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Khung giờ</div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: '#dc2626' }}>
                  ⏰ {registration.khung_gio || 'Chưa có'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Screening Form */}
      {phieu && (
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: '#dc2626', paddingBottom: 'var(--spacing-md)', borderBottom: '2px solid #dc2626' }}>
              📋 Phiếu Khám Sàng Lọc Sức Khỏe
            </h3>

            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              {/* Question 1 */}
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)' }}>
                  1. Anh/chị từng hiến máu chưa?
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>
                  {phieu.q1?.hien_mau_chua === 'co' ? '✅ Có' : '❌ Chưa'}
                </div>
              </div>

              {/* Question 2 */}
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)' }}>
                  2. Hiện tại, anh/chị có mắc bệnh lý nào không?
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>
                  {phieu.q2?.mac_benh === 'co' 
                    ? `⚠️ Có: ${phieu.q2?.benh_gi || ''}` 
                    : '✅ Không'}
                </div>
              </div>

              {/* Question 3 */}
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)' }}>
                  3. Trước đây, anh/chị có từng mắc các bệnh nghiêm trọng?
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>
                  {phieu.q3?.benh_ly_truoc === 'co' ? `⚠️ Có` : '✅ Không'}
                  {phieu.q3?.benh_khac && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>({phieu.q3.benh_khac})</div>}
                </div>
              </div>

              {/* Question 4-8 */}
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)' }}>
                  4. Trong 12 tháng gần đây
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>
                  {phieu.q4?.items?.includes('Không') ? (
                    '✅ Không'
                  ) : (
                    <div>
                      <div style={{ color: '#f59e0b', marginBottom: '4px' }}>⚠️ Có:</div>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: 'var(--font-size-sm)' }}>
                        {phieu.q4?.items?.filter(item => item !== 'Không').map((item, idx) => (
                          <li key={idx} style={{ marginBottom: '2px' }}>{item}</li>
                        ))}
                      </ul>
                      {phieu.q4?.vacxin && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>Vacxin: {phieu.q4.vacxin}</div>}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)' }}>
                  5. Trong 6 tháng gần đây
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>
                  {phieu.q5?.items?.includes('Không') ? (
                    '✅ Không'
                  ) : (
                    <div>
                      <div style={{ color: '#f59e0b', marginBottom: '4px' }}>⚠️ Có:</div>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: 'var(--font-size-sm)' }}>
                        {phieu.q5?.items?.filter(item => item !== 'Không').map((item, idx) => (
                          <li key={idx} style={{ marginBottom: '2px' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)' }}>
                  6. Trong 1 tháng gần đây
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>
                  {phieu.q6?.items?.includes('Không') ? (
                    '✅ Không'
                  ) : (
                    <div>
                      <div style={{ color: '#f59e0b', marginBottom: '4px' }}>⚠️ Có:</div>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: 'var(--font-size-sm)' }}>
                        {phieu.q6?.items?.filter(item => item !== 'Không').map((item, idx) => (
                          <li key={idx} style={{ marginBottom: '2px' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)' }}>
                  7. Trong 14 ngày gần đây
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>
                  {phieu.q7?.mac_benh === 'Không' ? (
                    '✅ Không'
                  ) : (
                    <div>
                      <div style={{ color: '#f59e0b' }}>⚠️ {phieu.q7?.mac_benh}</div>
                      {phieu.q7?.khac && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>Chi tiết khác: {phieu.q7.khac}</div>}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)' }}>
                  8. Trong 7 ngày gần đây
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)' }}>
                  {phieu.q8?.dung_thuoc === 'Không' ? (
                    '✅ Không'
                  ) : (
                    <div>
                      <div style={{ color: '#f59e0b' }}>⚠️ {phieu.q8?.dung_thuoc}</div>
                      {phieu.q8?.khac && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>Chi tiết khác: {phieu.q8.khac}</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Result */}
      {registration.id_ket_qua && (
        <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <div className="card-body">
            <h3 style={{ 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: 'var(--font-weight-bold)', 
              marginBottom: 'var(--spacing-lg)', 
              color: '#16a34a',
              paddingBottom: 'var(--spacing-md)',
              borderBottom: '2px solid #16a34a',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)'
            }}>
              <span style={{ fontSize: 'var(--font-size-2xl)' }}>🎉</span>
              Kết Quả Hiến Máu
            </h3>

            <div style={{ 
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              padding: 'var(--spacing-2xl)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid #16a34a'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-2xl)' }}>
                {/* Ngày hiến */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-3xl)', 
                    marginBottom: 'var(--spacing-sm)',
                    color: '#16a34a'
                  }}>
                    📅
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: '#166534', marginBottom: '4px' }}>
                    Ngày hiến máu
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xl)', 
                    fontWeight: 'var(--font-weight-bold)',
                    color: '#15803d'
                  }}>
                    {new Date(registration.ngay_hien).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                {/* Lượng máu */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-3xl)', 
                    marginBottom: 'var(--spacing-sm)',
                    color: '#dc2626'
                  }}>
                    🩸
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: '#166534', marginBottom: '4px' }}>
                    Lượng máu hiến
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-3xl)', 
                    fontWeight: 'var(--font-weight-bold)',
                    color: '#dc2626'
                  }}>
                    {registration.luong_ml} ml
                  </div>
                </div>

                {/* Kết quả */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-3xl)', 
                    marginBottom: 'var(--spacing-sm)',
                    color: '#16a34a'
                  }}>
                    ✅
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: '#166534', marginBottom: '4px' }}>
                    Kết quả
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xl)', 
                    fontWeight: 'var(--font-weight-bold)',
                    color: '#15803d'
                  }}>
                    {registration.ket_qua_hien_mau}
                  </div>
                </div>
              </div>

              {/* Thank you message */}
              <div style={{ 
                marginTop: 'var(--spacing-2xl)',
                textAlign: 'center',
                padding: 'var(--spacing-lg)',
                background: 'white',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #86efac'
              }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-sm)' }}>
                  ❤️ Cảm ơn bạn đã hiến máu! ❤️
                </div>
                <p style={{ color: '#166534', fontSize: 'var(--font-size-lg)', margin: 0 }}>
                  Giọt máu bạn hiến là món quà vô giá cho những người đang cần. Cảm ơn bạn đã lan tỏa yêu thương!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note */}
      <div style={{ 
        marginTop: 'var(--spacing-lg)', 
        padding: 'var(--spacing-md)', 
        background: '#eff6ff',
        borderRadius: 'var(--radius-md)',
        borderLeft: '4px solid #3b82f6'
      }}>
        <strong>💡 Lưu ý:</strong>
        <ul style={{ marginTop: 'var(--spacing-sm)', paddingLeft: 'var(--spacing-lg)' }}>
          <li>Vui lòng đến đúng ngày và giờ đã đăng ký</li>
          <li>Mang theo CMND/CCCD để xác minh danh tính</li>
          <li>Ăn uống đầy đủ trước khi hiến máu</li>
          <li>Liên hệ tổ chức nếu cần thay đổi lịch hẹn</li>
        </ul>
      </div>
    </Layout>
  );
};

export default RegistrationDetail;
