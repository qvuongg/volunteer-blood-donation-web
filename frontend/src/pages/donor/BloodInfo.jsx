import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const BloodInfo = () => {
  const [bloodInfo, setBloodInfo] = useState(null);
  const [nhom_mau, setNhom_mau] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBloodInfo();
  }, []);

  const fetchBloodInfo = async () => {
    try {
      const response = await api.get('/donors/blood-info');
      if (response.data.success && response.data.data.donor) {
        const donor = response.data.data.donor;
        setBloodInfo(donor);
        setNhom_mau(donor.nhom_mau || '');
      }
    } catch (error) {
      console.error('Error fetching blood info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await api.put('/donors/blood-info', { nhom_mau });
      if (response.data.success) {
        setMessage('success');
        setTimeout(() => {
          navigate('/donor/dashboard');
        }, 1500);
      }
    } catch (error) {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  const bloodTypes = [
    { value: 'A', label: 'A', color: '#ef4444' },
    { value: 'B', label: 'B', color: '#3b82f6' },
    { value: 'AB', label: 'AB', color: '#8b5cf6' },
    { value: 'O', label: 'O', color: '#10b981' }
  ];

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
        <h1 className="page-title">Cập nhật nhóm máu</h1>
        <p className="page-description">
          Cập nhật thông tin nhóm máu của bạn để chúng tôi phục vụ tốt hơn
        </p>
      </div>

      {bloodInfo?.nhom_mau_xac_nhan && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--spacing-xl)', maxWidth: '600px', margin: '0 auto var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div style={{ flex: 1 }}>
              <strong>Nhóm máu đã được xác thực</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-sm)' }}>
                Xác thực bởi: <strong>{bloodInfo.ten_benh_vien_xac_nhan}</strong> vào ngày {new Date(bloodInfo.ngay_xac_nhan).toLocaleDateString('vi-VN')}
                {bloodInfo.ghi_chu_xac_nhan && (
                  <><br />Ghi chú: {bloodInfo.ghi_chu_xac_nhan}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-body">
          {message === 'success' && (
            <div className="alert alert-success">
              Cập nhật nhóm máu thành công! Đang chuyển hướng...
            </div>
          )}
          {message === 'error' && (
            <div className="alert alert-danger">
              Có lỗi xảy ra. Vui lòng thử lại.
        </div>
      )}

      <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Chọn nhóm máu của bạn *</label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-md)'
              }}>
                {bloodTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => !bloodInfo?.nhom_mau_xac_nhan && setNhom_mau(type.value)}
                    disabled={bloodInfo?.nhom_mau_xac_nhan}
                    style={{
                      padding: 'var(--spacing-xl)',
                      border: nhom_mau === type.value ? `3px solid ${type.color}` : '2px solid var(--gray-300)',
                      borderRadius: 'var(--radius-lg)',
                      background: nhom_mau === type.value ? `${type.color}15` : 'white',
                      cursor: bloodInfo?.nhom_mau_xac_nhan ? 'not-allowed' : 'pointer',
                      opacity: bloodInfo?.nhom_mau_xac_nhan ? 0.6 : 1,
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)'
                    }}
          >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill={nhom_mau === type.value ? type.color : 'var(--gray-400)'}>
                      <path d="M16 4s-10 11.667-10 16.667A10 10 0 0026 20.667C26 15.667 16 4 16 4z"/>
                    </svg>
                    <span style={{ 
                      fontSize: 'var(--font-size-2xl)', 
                      fontWeight: 'var(--font-weight-bold)',
                      color: nhom_mau === type.value ? type.color : 'var(--text-primary)'
                    }}>
                      {type.label}
                    </span>
                  </button>
            ))}
              </div>
            </div>

            <div style={{ 
              marginTop: 'var(--spacing-xl)', 
              padding: 'var(--spacing-lg)', 
              background: bloodInfo?.nhom_mau_xac_nhan ? 'var(--success-50)' : 'var(--gray-50)', 
              borderRadius: 'var(--radius-md)',
              border: bloodInfo?.nhom_mau_xac_nhan ? '1px solid var(--success-200)' : 'none'
            }}>
              <h4 style={{ marginTop: 0, fontSize: 'var(--font-size-base)' }}>
                {bloodInfo?.nhom_mau_xac_nhan ? '✓ Nhóm máu đã được xác thực' : 'Thông tin về nhóm máu'}
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
                {bloodInfo?.nhom_mau_xac_nhan ? (
                  'Nhóm máu của bạn đã được bệnh viện xác thực chính thức và không thể thay đổi.'
                ) : (
                  'Việc biết chính xác nhóm máu của bạn rất quan trọng trong quá trình hiến máu. Nhóm máu sẽ được xác thực chính thức khi bạn hiến máu lần đầu tại bệnh viện.'
                )}
              </p>
        </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
          {!bloodInfo?.nhom_mau_xac_nhan && (
          <button
            type="submit"
                  disabled={saving || !nhom_mau}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="small" />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật'
                  )}
          </button>
          )}
          <button
            type="button"
                onClick={() => navigate('/donor/dashboard')}
                className="btn btn-outline"
          >
            {bloodInfo?.nhom_mau_xac_nhan ? 'Quay lại' : 'Hủy'}
          </button>
        </div>
      </form>
    </div>
      </div>
    </Layout>
  );
};

export default BloodInfo;
