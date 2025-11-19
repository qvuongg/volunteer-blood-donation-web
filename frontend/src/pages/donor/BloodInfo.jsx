import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const BloodInfo = () => {
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
        setNhom_mau(response.data.data.donor.nhom_mau || '');
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
                    onClick={() => setNhom_mau(type.value)}
                    style={{
                      padding: 'var(--spacing-xl)',
                      border: nhom_mau === type.value ? `3px solid ${type.color}` : '2px solid var(--gray-300)',
                      borderRadius: 'var(--radius-lg)',
                      background: nhom_mau === type.value ? `${type.color}15` : 'white',
                      cursor: 'pointer',
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
              background: 'var(--gray-50)', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <h4 style={{ marginTop: 0, fontSize: 'var(--font-size-base)' }}>Thông tin về nhóm máu</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
                Việc biết chính xác nhóm máu của bạn rất quan trọng trong quá trình hiến máu. 
                Nếu chưa biết nhóm máu, bạn có thể xét nghiệm tại các cơ sở y tế hoặc trong lần hiến máu đầu tiên.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
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
              <button
                type="button"
                onClick={() => navigate('/donor/dashboard')}
                className="btn btn-outline"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default BloodInfo;
