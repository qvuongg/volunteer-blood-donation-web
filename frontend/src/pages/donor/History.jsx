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
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const totalBloodDonated = history.reduce((sum, item) => sum + (item.luong_ml || 0), 0);
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
          Xem lại hành trình hiến máu của bạn
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
              <circle cx="32" cy="32" r="24"/>
              <path d="M32 16v16l8 8"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Bạn chưa có lịch sử hiến máu
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {history.map((item, index) => (
            <div key={item.id_ket_qua} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-lg)' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-full)',
                    background: item.ket_qua === 'Dat' ? 'var(--success-50)' : 'var(--gray-100)',
                    color: item.ket_qua === 'Dat' ? 'var(--success-600)' : 'var(--gray-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}>
                    #{history.length - index}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 var(--spacing-sm)', fontSize: 'var(--font-size-lg)' }}>
                      {item.ten_su_kien}
                    </h3>
                    <div className="grid grid-cols-4">
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                          Bệnh viện
                        </p>
                        <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                          {item.ten_benh_vien}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                          Ngày hiến
                        </p>
                        <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                          {formatDate(item.ngay_hien)}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                          Lượng máu
                        </p>
                        <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-600)', margin: 0 }}>
                          {item.luong_ml} ml
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                          Kết quả
                        </p>
                        <span className={`badge ${item.ket_qua === 'Dat' ? 'badge-success' : 'badge-gray'}`}>
                          {item.ket_qua}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default History;
