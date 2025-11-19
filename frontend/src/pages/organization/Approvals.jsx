import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Approvals = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleApprove = async (id) => {
    if (!window.confirm('Bạn có chắc muốn duyệt đăng ký này?')) return;
    
    try {
      await api.put(`/approvals/registrations/${id}/approve`, {});
      alert('Đã duyệt thành công');
      fetchPendingRegistrations();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Lý do từ chối:');
    if (!reason) return;

    try {
      await api.put(`/approvals/registrations/${id}/reject`, { ghi_chu_duyet: reason });
      alert('Đã từ chối');
      fetchPendingRegistrations();
    } catch (error) {
      alert('Có lỗi xảy ra');
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
    </Layout>
  );
};

export default Approvals;
