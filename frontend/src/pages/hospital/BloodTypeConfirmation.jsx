import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const BloodTypeConfirmation = () => {
  const toast = useToast();
  const { user } = useAuth();
  const hospitalName = user?.ten_to_chuc || 'bệnh viện';
  const defaultNote = `Xác thực nhóm máu qua xét nghiệm tại ${hospitalName}`;
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, donor: null });
  const [changeFormData, setChangeFormData] = useState({
    nhom_mau: '',
    ghi_chu: ''
  });

  useEffect(() => {
    fetchAllDonors();
  }, []);

  const fetchAllDonors = async () => {
    try {
      const response = await api.get('/hospitals/blood-types/all');
      console.log('📋 Response from API:', response.data);
      if (response.data.success) {
        const donorList = response.data.data.donors || [];
        console.log('👥 Donors list:', donorList);
        setDonors(donorList);
      }
    } catch (error) {
      console.error('❌ Error fetching donors:', error);
      console.error('Response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (donor) => {
    setConfirmDialog({ isOpen: true, donor });
  };

  const confirmBloodType = async () => {
    const { donor } = confirmDialog;
    setConfirmDialog({ isOpen: false, donor: null });

    setConfirming(donor.id_nguoi_hien);

    try {
      const response = await api.post('/hospitals/blood-types/confirm', {
        id_nguoi_hien: donor.id_nguoi_hien,
        nhom_mau: donor.nhom_mau,
        ghi_chu: `${defaultNote}. Nhóm máu: ${donor.nhom_mau}`
      });

      if (response.data.success) {
        toast.success('Xác thực nhóm máu thành công!');
        fetchAllDonors(); // Refresh to show updated status
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setConfirming(null);
    }
  };

  const openChangeModal = (donor) => {
    setSelectedDonor(donor);
    setChangeFormData({
      nhom_mau: donor.nhom_mau,
      ghi_chu: defaultNote
    });
    setShowChangeModal(true);
  };

  const handleChangeAndConfirm = async () => {
    if (!changeFormData.nhom_mau) {
      toast.error('Vui lòng chọn nhóm máu');
      return;
    }

    setConfirming(selectedDonor.id_nguoi_hien);

    try {
      const trimmedNote = (changeFormData.ghi_chu || defaultNote).trim() || defaultNote;
      const ghiChu = changeFormData.nhom_mau === selectedDonor.nhom_mau
        ? `${trimmedNote}. Nhóm máu: ${changeFormData.nhom_mau}`
        : `${trimmedNote}. Nhóm máu: ${changeFormData.nhom_mau} (đã điều chỉnh từ ${selectedDonor.nhom_mau})`;

      const response = await api.post('/hospitals/blood-types/confirm', {
        id_nguoi_hien: selectedDonor.id_nguoi_hien,
        nhom_mau: changeFormData.nhom_mau,
        ghi_chu: ghiChu.trim()
      });

      if (response.data.success) {
        toast.success('Xác thực nhóm máu thành công!');
        fetchAllDonors(); // Refresh to show updated status
        setShowChangeModal(false);
        setSelectedDonor(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setConfirming(null);
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
        <h1 className="page-title">Xác thực nhóm máu</h1>
        <p className="page-description">
          Danh sách tất cả người hiến máu (chưa xác thực và đã xác thực nhóm máu)
        </p>
      </div>

      {donors.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <path d="M32 8s-16 14-16 20a16 16 0 0032 0c0-6-16-20-16-20z"/>
              <path d="M22 28l4 4 8-8"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Không có người hiến máu nào
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="alert alert-info" style={{ marginBottom: 'var(--spacing-xl)' }}>
            ℹ️ Danh sách tất cả người hiến máu đã tham gia sự kiện tại bệnh viện của bạn. Những người có tag "Chưa xác thực" cần được xác thực nhóm máu sau khi xét nghiệm.
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Nhóm máu (tự khai)</th>
                  <th>Số lần hiến</th>
                  <th>Hiến gần nhất</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {donors.map(donor => (
                  <tr key={donor.id_nguoi_hien}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {donor.ho_ten}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{donor.email}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{donor.so_dien_thoai || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <span style={{ 
                          fontSize: 'var(--font-size-lg)', 
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--primary-600)'
                        }}>
                          {donor.nhom_mau}
                        </span>
                        {donor.nhom_mau_xac_nhan ? (
                          <span className="badge badge-success">Đã xác thực</span>
                        ) : (
                          <span className="badge badge-warning">Chưa xác thực</span>
                        )}
                      </div>
                    </td>
                    <td>{donor.tong_so_lan_hien}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>
                      {donor.ngay_hien_gan_nhat 
                        ? new Date(donor.ngay_hien_gan_nhat).toLocaleDateString('vi-VN')
                        : '-'
                      }
                    </td>
                    <td>
                      {donor.nhom_mau_xac_nhan ? (
                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                          Đã xác thực
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleConfirm(donor)}
                            disabled={confirming === donor.id_nguoi_hien}
                          >
                            {confirming === donor.id_nguoi_hien ? (
                              <>
                                <LoadingSpinner size="small" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M6 8l2 2 4-4"/>
                                </svg>
                                Xác nhận
                              </>
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => openChangeModal(donor)}
                            disabled={confirming === donor.id_nguoi_hien}
                          >
                            Điều chỉnh & Xác nhận
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="card-body">
              <h4 style={{ marginTop: 0 }}>📋 Lưu ý quan trọng</h4>
              <ul style={{ marginBottom: 0, paddingLeft: 'var(--spacing-lg)', lineHeight: 'var(--line-height-relaxed)' }}>
                <li>Chỉ xác thực sau khi đã thực hiện xét nghiệm nhóm máu chính thức</li>
                <li>Nếu nhóm máu tự khai không khớp với kết quả xét nghiệm, chọn "Điều chỉnh & Xác nhận"</li>
                <li>Sau khi xác thực, người hiến máu sẽ thấy badge "Đã xác thực" trên hồ sơ</li>
                <li>Hành động này không thể hoàn tác, vui lòng kiểm tra kỹ trước khi xác nhận</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Change Blood Type Modal */}
      {showChangeModal && selectedDonor && (
        <div
          onClick={() => setShowChangeModal(false)}
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
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--spacing-lg)',
              color: '#dc2626'
            }}>
              Điều chỉnh & Xác nhận nhóm máu
            </h2>

            <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                <strong>Người hiến:</strong> {selectedDonor.ho_ten}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Email: {selectedDonor.email}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Nhóm máu tự khai: <span className="badge badge-danger">{selectedDonor.nhom_mau}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Nhóm máu sau xét nghiệm <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="form-input"
                value={changeFormData.nhom_mau}
                onChange={(e) => setChangeFormData({ ...changeFormData, nhom_mau: e.target.value })}
                required
              >
                <option value="">-- Chọn nhóm máu --</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
              {changeFormData.nhom_mau && changeFormData.nhom_mau !== selectedDonor.nhom_mau && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: '#dc2626', marginTop: 'var(--spacing-xs)' }}>
                  ⚠️ Nhóm máu khác với khai báo ban đầu ({selectedDonor.nhom_mau} → {changeFormData.nhom_mau})
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <textarea
                className="form-input"
                rows="4"
                value={changeFormData.ghi_chu}
                onChange={(e) => setChangeFormData({ ...changeFormData, ghi_chu: e.target.value })}
                placeholder="Nhập ghi chú thêm (nếu có)..."
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-xl)' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowChangeModal(false);
                  setSelectedDonor(null);
                }}
                disabled={confirming === selectedDonor?.id_nguoi_hien}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleChangeAndConfirm}
                disabled={confirming === selectedDonor?.id_nguoi_hien || !changeFormData.nhom_mau}
              >
                {confirming === selectedDonor?.id_nguoi_hien ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận nhóm máu"
        message={confirmDialog.donor ? `Xác nhận nhóm máu ${confirmDialog.donor.nhom_mau} cho người hiến máu ${confirmDialog.donor.ho_ten}?` : ''}
        onConfirm={confirmBloodType}
        onCancel={() => setConfirmDialog({ isOpen: false, donor: null })}
      />
    </Layout>
  );
};

export default BloodTypeConfirmation;

