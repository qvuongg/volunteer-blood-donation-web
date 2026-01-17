import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/donors/history');
      if (response.data.success) {
        setHistory(response.data.data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        if (typeof dateString === 'string') {
          const standardized = dateString.replace(' ', 'T');
          const retryDate = new Date(standardized);
          if (!isNaN(retryDate.getTime())) {
            return retryDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
          }
        }
        return 'Ngày không hợp lệ';
      }
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'Lỗi hiển thị';
    }
  };

  const getStatusInfo = (status) => {
    if (status === 'Dat') return { label: 'Thành công', color: 'success' };
    if (status === 'Khong dat') return { label: 'Chưa đạt', color: 'danger' };
    return { label: status, color: 'gray' };
  };

  const totalBloodDonated = history.reduce((sum, item) => {
    return item.ket_qua === 'Dat' ? sum + (item.luong_ml || 0) : sum;
  }, 0);
  const successfulDonations = history.filter(item => item.ket_qua === 'Dat').length;

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
        <h1 className="page-title">Lịch sử hiến máu</h1>
        <p className="page-description">
          Hành trình nhân ái của bạn
        </p>
      </div>

      {history.length > 0 && (
        <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', margin: '0 0 8px' }}>
                Tổng lần hiến
              </p>
              <h2 style={{ color: 'var(--primary-600)', fontSize: 'var(--font-size-3xl)', margin: 0 }}>
                {history.length}
              </h2>
            </div>
          </div>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', margin: '0 0 8px' }}>
                Tổng lượng máu
              </p>
              <h2 style={{ color: 'var(--success-600)', fontSize: 'var(--font-size-3xl)', margin: 0 }}>
                {totalBloodDonated.toLocaleString()} ml
              </h2>
            </div>
          </div>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', margin: '0 0 8px' }}>
                Hiến thành công
              </p>
              <h2 style={{ color: 'var(--secondary-600)', fontSize: 'var(--font-size-3xl)', margin: 0 }}>
                {successfulDonations}
              </h2>
            </div>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <circle cx="32" cy="32" r="24" />
              <path d="M32 16v16l8 8" />
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Bạn chưa có lịch sử hiến máu
            </p>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '40px' }}>
          {/* Vertical Line */}
          <div style={{
            position: 'absolute',
            left: '19px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'var(--gray-200)',
            zIndex: 0
          }} />

          {history.map((item, index) => {
            const statusInfo = getStatusInfo(item.ket_qua);
            const isLatest = index === history.length - 1;

            return (
              <div key={item.id_ket_qua} style={{ position: 'relative', marginBottom: 'var(--spacing-xl)' }}>
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-41px',
                  top: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isLatest ? 'var(--primary-600)' : 'white',
                  border: `4px solid ${isLatest ? 'var(--primary-100)' : 'var(--gray-200)'}`,
                  color: isLatest ? 'white' : 'var(--gray-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  zIndex: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  {index + 1}
                </div>

                <div className="card" style={{
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderLeft: isLatest ? '4px solid var(--primary-600)' : '1px solid var(--gray-200)'
                }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                      <div>
                        <div style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--text-tertiary)',
                          marginBottom: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="3" width="10" height="9" rx="1" />
                              <path d="M2 5h10M4 2v2M10 2v2" />
                            </svg>
                            Ngày hiến: {formatDate(item.ngay_hien)}
                          </div>
                          {item.ngay_tao && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12.6 4.4L5.6 11.4 1.4 7.2" />
                              </svg>
                              Ngày trả kết quả: {formatDate(item.ngay_tao)}
                            </div>
                          )}
                        </div>
                        <h3 style={{ margin: '0 0 var(--spacing-sm)', fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>
                          {item.ten_su_kien}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 8h4M2 12h3M2 4h5M1 14h7a1 1 0 001-1V3a1 1 0 00-1-1H1v12z" />
                            <path d="M14 8a6 6 0 11-12 0" />
                          </svg>
                          {item.ten_benh_vien}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span className={`badge ${statusInfo.color === 'success' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 'var(--font-size-sm)' }}>
                          {statusInfo.label}
                        </span>
                        <div style={{
                          background: 'var(--primary-50)',
                          color: 'var(--primary-700)',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 12.5l-1.5-1.5C3.5 8.5 2.5 7.5 2.5 5.5c0-1.7 1.3-3 3-3 1 0 1.9.4 2.5 1.1.6-.7 1.5-1.1 2.5-1.1 1.7 0 3 1.3 3 3 0 2-1 3-4 5.5l-1.5 1.5z" />
                          </svg>
                          {item.luong_ml} ml
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default History;
