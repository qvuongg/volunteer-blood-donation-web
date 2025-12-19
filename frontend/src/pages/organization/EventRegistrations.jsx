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
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
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

  const openDetailModal = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
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
        setShowDetailModal(false);
        fetchData();
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

  const renderPhieuKhamSangLoc = (phieu) => {
    if (!phieu) return <span style={{ color: 'var(--text-secondary)' }}>Chưa có thông tin</span>;

    return (
      <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>1. Anh/chị từng hiến máu chưa?</strong>
          <div>{phieu.q1?.hien_mau_chua === 'co' ? '✅ Có' : '❌ Chưa'}</div>
        </div>
        
        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>2. Hiện tại, anh/chị có mắc bệnh lý nào không?</strong>
          <div>{phieu.q2?.mac_benh === 'co' ? `⚠️ Có: ${phieu.q2?.benh_gi || ''}` : '✅ Không'}</div>
        </div>
        
        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>3. Trước đây, anh/chị có từng mắc các bệnh nghiêm trọng?</strong>
          <div>{phieu.q3?.benh_ly_truoc === 'co' ? '⚠️ Có' : '✅ Không'}</div>
          {phieu.q3?.benh_khac && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-xs)' }}>({phieu.q3.benh_khac})</div>}
        </div>
        
        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>4. Trong 12 tháng gần đây, anh/chị có:</strong>
          {phieu.q4?.items?.includes('khong') ? (
            <div>✅ Không</div>
          ) : (
            <div>
              <div>⚠️ Có:</div>
              <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                {phieu.q4?.items?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {phieu.q4?.vacxin && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-xs)' }}>Vacxin: {phieu.q4.vacxin}</div>}
        </div>
        
        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>5. Trong 06 tháng gần đây, anh/chị có:</strong>
          {phieu.q5?.items?.includes('khong') ? (
            <div>✅ Không</div>
          ) : (
            <div>
              <div>⚠️ Có:</div>
              <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                {phieu.q5?.items?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>6. Trong 01 tháng gần đây, anh/chị có:</strong>
          {phieu.q6?.items?.includes('khong') ? (
            <div>✅ Không</div>
          ) : (
            <div>
              <div>⚠️ Có:</div>
              <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                {phieu.q6?.items?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>7. Trong 14 ngày gần đây, anh/chị có mắc bệnh (cúm, cảm lạnh, sốt...)?</strong>
          <div>{phieu.q7?.mac_benh === 'khong' ? '✅ Không' : '⚠️ Có'}</div>
          {phieu.q7?.khac && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-xs)' }}>({phieu.q7.khac})</div>}
        </div>
        
        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>8. Trong 7 ngày gần đây, anh/chị có sử dụng thuốc?</strong>
          <div>{phieu.q8?.dung_thuoc === 'khong' ? '✅ Không' : '⚠️ Có'}</div>
          {phieu.q8?.khac && <div style={{ marginTop: '4px', fontSize: 'var(--font-size-xs)' }}>({phieu.q8.khac})</div>}
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
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>STT</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>Tên</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>Email</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>SĐT</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>Giới tính</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>Ngày đăng ký</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>Trạng thái</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg, index) => (
                    <tr key={reg.id_dang_ky} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>{index + 1}</td>
                      <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{reg.ho_ten}</td>
                      <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>{reg.email}</td>
                      <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>{reg.so_dien_thoai || '-'}</td>
                      <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>{reg.gioi_tinh}</td>
                      <td style={{ padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>{new Date(reg.ngay_dang_ky).toLocaleDateString('vi-VN')}</td>
                      <td style={{ padding: 'var(--spacing-md)' }}>{getStatusBadge(reg.trang_thai)}</td>
                      <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openDetailModal(reg)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRegistration && (
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
                Chi tiết đăng ký - {selectedRegistration.ho_ten}
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

            {/* Thông tin cơ bản */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-md)',
                color: '#dc2626'
              }}>
                Thông tin cơ bản
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                <div><strong>Họ tên:</strong> {selectedRegistration.ho_ten}</div>
                <div><strong>Email:</strong> {selectedRegistration.email}</div>
                <div><strong>Số điện thoại:</strong> {selectedRegistration.so_dien_thoai || '-'}</div>
                <div><strong>Giới tính:</strong> {selectedRegistration.gioi_tinh}</div>
                <div><strong>Ngày đăng ký:</strong> {new Date(selectedRegistration.ngay_dang_ky).toLocaleDateString('vi-VN')}</div>
                <div><strong>Trạng thái:</strong> {getStatusBadge(selectedRegistration.trang_thai)}</div>
                <div><strong>Ngày hẹn:</strong> {selectedRegistration.ngay_hen_hien ? new Date(selectedRegistration.ngay_hen_hien).toLocaleDateString('vi-VN') : 'Chưa có'}</div>
                <div><strong>Khung giờ:</strong> {selectedRegistration.khung_gio || 'Chưa có'}</div>
                <div><strong>Nhóm máu:</strong> <span className="badge badge-danger">{selectedRegistration.nhom_mau || '?'}</span></div>
                <div><strong>Đã hiến:</strong> {selectedRegistration.tong_so_lan_hien || 0} lần</div>
                {selectedRegistration.lan_hien_gan_nhat && (
                  <div><strong>Lần gần nhất:</strong> {new Date(selectedRegistration.lan_hien_gan_nhat).toLocaleDateString('vi-VN')}</div>
                )}
              </div>
            </div>

            {/* Phiếu khám sàng lọc */}
            {selectedRegistration.phieu_kham_sang_loc && (
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3 style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-md)',
                  color: '#dc2626'
                }}>
                  Phiếu khám sàng lọc
                </h3>
                {renderPhieuKhamSangLoc(selectedRegistration.phieu_kham_sang_loc)}
              </div>
            )}

            {/* Ghi chú duyệt */}
            {selectedRegistration.ghi_chu_duyet && (
              <div style={{
                marginBottom: 'var(--spacing-xl)',
                padding: 'var(--spacing-md)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid #dc2626'
              }}>
                <strong>Ghi chú duyệt:</strong> {selectedRegistration.ghi_chu_duyet}
              </div>
            )}

            {/* Actions */}
            {selectedRegistration.trang_thai === 'cho_duyet' && (
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-lg)',
                borderTop: '1px solid var(--gray-200)',
                justifyContent: 'flex-end'
              }}>
                <button
                  className="btn btn-success"
                  onClick={() => openApprovalModal(selectedRegistration, 'da_duyet')}
                >
                  ✅ Duyệt đăng ký
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => openApprovalModal(selectedRegistration, 'tu_choi')}
                >
                  ❌ Từ chối
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval Modal - Đè lên Detail Modal */}
      {showApprovalModal && selectedRegistration && (
        <div 
          onClick={() => setShowApprovalModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 'var(--spacing-lg)'
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

            {/* Lý do mẫu */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-sm)'
              }}>
                {approvalData.trang_thai === 'da_duyet' ? 'Lý do duyệt (chọn nhiều):' : 'Lý do từ chối (chọn nhiều):'}
              </label>
              {(approvalData.trang_thai === 'da_duyet' ? lyDoMau : lyDoTuChoi).map((lyDo, idx) => (
                <label key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: 'var(--spacing-sm)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  background: approvalData.ly_do_mau.includes(lyDo) ? 'var(--gray-100)' : 'transparent'
                }}>
                  <input
                    type="checkbox"
                    checked={approvalData.ly_do_mau.includes(lyDo)}
                    onChange={() => toggleLyDoMau(lyDo)}
                  />
                  <span>{lyDo}</span>
                </label>
              ))}
            </div>

            {/* Ghi chú tự do */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-sm)'
              }}>
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

            {/* Buttons */}
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

export default EventRegistrations;
