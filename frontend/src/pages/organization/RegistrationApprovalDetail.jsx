import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const RegistrationApprovalDetail = () => {
  const { eventId, registrationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    trang_thai: '',
    ly_do_mau: [],
    ghi_chu_duyet: ''
  });

  const lyDoMauDuyet = [
    'Đủ điều kiện sức khỏe',
    'Thông tin đầy đủ và chính xác',
    'Đã xác minh danh tính',
    'Phù hợp với yêu cầu sự kiện'
  ];

  const lyDoMauTuChoi = [
    'Không đủ điều kiện sức khỏe',
    'Đã hiến máu gần đây',
    'Thông tin không chính xác',
    'Có bệnh lý không phù hợp',
    'Khác (ghi rõ bên dưới)'
  ];

  useEffect(() => {
    fetchRegistrationDetail();
  }, [eventId, registrationId]);

  const fetchRegistrationDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/registrations/event/${eventId}/list`);
      if (response.data.success) {
        const reg = response.data.data.registrations.find(
          r => r.id_dang_ky === parseInt(registrationId)
        );
        if (reg) {
          setRegistration(reg);
        } else {
          toast.error('Không tìm thấy đơn đăng ký');
          navigate(`/organization/events/${eventId}/registrations`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin');
      navigate(`/organization/events/${eventId}/registrations`);
    } finally {
      setLoading(false);
    }
  };

  const toggleLyDoMau = (lyDo) => {
    const newLyDoMau = approvalForm.ly_do_mau.includes(lyDo)
      ? approvalForm.ly_do_mau.filter(item => item !== lyDo)
      : [...approvalForm.ly_do_mau, lyDo];
    setApprovalForm({ ...approvalForm, ly_do_mau: newLyDoMau });
  };

  const handleApproval = async (status) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${status === 'da_duyet' ? 'duyệt' : 'từ chối'} đơn này?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const ghiChu = approvalForm.ly_do_mau.length > 0
        ? approvalForm.ly_do_mau.join(', ') + (approvalForm.ghi_chu_duyet ? `. ${approvalForm.ghi_chu_duyet}` : '')
        : approvalForm.ghi_chu_duyet;

      const response = await api.put(`/registrations/${registrationId}/status`, {
        trang_thai: status,
        ghi_chu_duyet: ghiChu
      });

      if (response.data.success) {
        toast.success(status === 'da_duyet' ? 'Đã duyệt đăng ký thành công' : 'Đã từ chối đăng ký');
        navigate(`/organization/events/${eventId}/registrations`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
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
            <button className="btn btn-primary" onClick={() => navigate(`/organization/events/${eventId}/registrations`)}>
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
          <h1 className="page-title">Chi tiết đơn đăng ký - Duyệt đăng ký</h1>
          <p className="page-description">
            Mã đơn: #{registration.id_dang_ky}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(`/organization/events/${eventId}/registrations`)}>
          Quay lại danh sách
        </button>
      </div>

      {/* Status */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
                Trạng thái: {getStatusBadge(registration.trang_thai)}
              </h2>
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

      {/* Donor Info */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: '#dc2626' }}>
            👤 Thông tin người hiến máu
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Họ và tên
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                {registration.ho_ten}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Email
              </div>
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {registration.email}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Số điện thoại
              </div>
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {registration.so_dien_thoai || '-'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Giới tính
              </div>
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {registration.gioi_tinh}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Ngày sinh
              </div>
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {new Date(registration.ngay_sinh).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Nhóm máu
              </div>
              <div>
                <span className="badge badge-danger" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  {registration.nhom_mau || '?'}
                </span>
                {registration.nhom_mau_xac_nhan ? (
                  <span style={{ marginLeft: '8px', color: '#16a34a', fontSize: 'var(--font-size-sm)' }}>✅ Đã xác nhận</span>
                ) : (
                  <span style={{ marginLeft: '8px', color: '#f59e0b', fontSize: 'var(--font-size-sm)' }}>⚠️ Chưa xác nhận</span>
                )}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Đã hiến
              </div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', color: '#dc2626' }}>
                {registration.tong_so_lan_hien || 0} lần
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Lần gần nhất
              </div>
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {registration.lan_hien_gan_nhat ? new Date(registration.lan_hien_gan_nhat).toLocaleDateString('vi-VN') : 'Chưa có'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Ngày hẹn
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: '#dc2626' }}>
                📅 {registration.ngay_hen_hien ? new Date(registration.ngay_hen_hien).toLocaleDateString('vi-VN') : 'Chưa có'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Screening */}
      {phieu && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-body">
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: '#dc2626', paddingBottom: 'var(--spacing-md)', borderBottom: '2px solid #dc2626' }}>
              📋 Phiếu Khám Sàng Lọc Sức Khỏe
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
                    1. Đã hiến máu:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-lg)' }}>
                    {phieu.q1?.hien_mau_chua === 'co' ? '✅ Có' : '❌ Chưa'}
                  </div>
                </div>

                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
                    2. Mắc bệnh hiện tại:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-lg)' }}>
                    {phieu.q2?.mac_benh === 'co' 
                      ? `⚠️ Có: ${phieu.q2?.benh_gi || ''}` 
                      : '✅ Không'}
                  </div>
                </div>

                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
                    3. Bệnh lý trước:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-lg)' }}>
                    {phieu.q3?.benh_ly_truoc === 'co' ? `⚠️ Có` : '✅ Không'}
                    {phieu.q3?.benh_khac && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>({phieu.q3.benh_khac})</div>}
                  </div>
                </div>

                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
                    4. Trong 12 tháng:
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
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
                    5. Trong 6 tháng:
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

                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
                    6. Trong 1 tháng:
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

                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
                    7. Trong 14 ngày:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-lg)' }}>
                    {phieu.q7?.mac_benh === 'Không' ? (
                      '✅ Không'
                    ) : (
                      <div>
                        <div style={{ color: '#f59e0b' }}>⚠️ {phieu.q7?.mac_benh}</div>
                        {phieu.q7?.khac && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>Chi tiết: {phieu.q7.khac}</div>}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
                    8. Trong 7 ngày:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-lg)' }}>
                    {phieu.q8?.dung_thuoc === 'Không' ? (
                      '✅ Không'
                    ) : (
                      <div>
                        <div style={{ color: '#f59e0b' }}>⚠️ {phieu.q8?.dung_thuoc}</div>
                        {phieu.q8?.khac && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>Chi tiết: {phieu.q8.khac}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Form - Only show if pending */}
      {registration.trang_thai === 'cho_duyet' && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-body">
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: '#dc2626' }}>
              ✍️ Duyệt đăng ký
            </h3>

            {/* Reason templates */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ display: 'block', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)' }}>
                Lý do mẫu (có thể chọn nhiều):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {(approvalForm.trang_thai === 'da_duyet' ? lyDoMauDuyet : lyDoMauTuChoi).map((lyDo, idx) => (
                  <label key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: 'var(--spacing-sm)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    background: approvalForm.ly_do_mau.includes(lyDo) ? 'var(--gray-100)' : 'transparent'
                  }}>
                    <input
                      type="checkbox"
                      checked={approvalForm.ly_do_mau.includes(lyDo)}
                      onChange={() => toggleLyDoMau(lyDo)}
                    />
                    <span>{lyDo}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom note */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Ghi chú thêm:
              </label>
              <textarea
                className="form-input"
                rows="4"
                value={approvalForm.ghi_chu_duyet}
                onChange={(e) => setApprovalForm({ ...approvalForm, ghi_chu_duyet: e.target.value })}
                placeholder="Nhập ghi chú thêm (không bắt buộc)..."
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button
                className="btn btn-success"
                onClick={() => {
                  setApprovalForm({ ...approvalForm, trang_thai: 'da_duyet' });
                  setTimeout(() => handleApproval('da_duyet'), 0);
                }}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? 'Đang xử lý...' : '✅ Duyệt đăng ký'}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setApprovalForm({ ...approvalForm, trang_thai: 'tu_choi' });
                  setTimeout(() => handleApproval('tu_choi'), 0);
                }}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? 'Đang xử lý...' : '❌ Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already processed */}
      {registration.trang_thai !== 'cho_duyet' && registration.ghi_chu_duyet && (
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-md)', color: '#dc2626' }}>
              📝 Ghi chú duyệt
            </h3>
            <div style={{ 
              padding: 'var(--spacing-md)', 
              background: 'var(--gray-50)', 
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid #dc2626'
            }}>
              {registration.ghi_chu_duyet}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RegistrationApprovalDetail;

