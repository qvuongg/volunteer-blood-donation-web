import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import InputDialog from '../../components/InputDialog';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const Approvals = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmApprove, setConfirmApprove] = useState({ isOpen: false, id: null });
  const [inputReject, setInputReject] = useState({ isOpen: false, id: null });
  const { showToast } = useToast();

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await api.get('/approvals/pending');
      if (response.data.success) {
        setPendingRegistrations(response.data.data.registrations || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id) => {
    setConfirmApprove({ isOpen: true, id });
  };

  const confirmApproveAction = async () => {
    const { id } = confirmApprove;
    setConfirmApprove({ isOpen: false, id: null });
    
    try {
      await api.put(`/approvals/registrations/${id}/approve`, {});
      showToast('Đã duyệt thành công', 'success');
      fetchPendingRegistrations();
    } catch (error) {
      showToast('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleReject = (id) => {
    setInputReject({ isOpen: true, id });
  };

  const confirmRejectAction = async (reason) => {
    const { id } = inputReject;
    setInputReject({ isOpen: false, id: null });

    try {
      await api.put(`/approvals/registrations/${id}/reject`, { ghi_chu_duyet: reason });
      showToast('Đã từ chối', 'success');
      fetchPendingRegistrations();
    } catch (error) {
      showToast('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message), 'error');
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
        <h1 className="page-title">Duyệt đăng ký</h1>
        <p className="page-description">
          Duyệt các đăng ký hiến máu chờ xử lý
        </p>
      </div>

      {pendingRegistrations.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Không có đăng ký nào chờ duyệt
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Người hiến</th>
                <th>Sự kiện</th>
                <th>Ngày đăng ký</th>
                <th>Nhóm máu</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingRegistrations.map(reg => (
                <tr key={reg.id_dang_ky}>
                  <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {reg.ho_ten}
                  </td>
                  <td>{reg.ten_su_kien}</td>
                  <td>{new Date(reg.ngay_dang_ky).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className="badge badge-danger">{reg.nhom_mau || '?'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleApprove(reg.id_dang_ky)}
                      >
                        Duyệt
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleReject(reg.id_dang_ky)}
                      >
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
    </div>
      )}

      <ConfirmDialog
        isOpen={confirmApprove.isOpen}
        title="Xác nhận duyệt"
        message="Bạn có chắc muốn duyệt đăng ký này?"
        onConfirm={confirmApproveAction}
        onCancel={() => setConfirmApprove({ isOpen: false, id: null })}
      />

      <InputDialog
        isOpen={inputReject.isOpen}
        title="Từ chối đăng ký"
        message="Vui lòng nhập lý do từ chối:"
        placeholder="Lý do từ chối..."
        onConfirm={confirmRejectAction}
        onCancel={() => setInputReject({ isOpen: false, id: null })}
      />
    </Layout>
  );
};

export default Approvals;
