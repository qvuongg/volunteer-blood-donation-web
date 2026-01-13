import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const BloodInfo = () => {
  const [loading, setLoading] = useState(true);
  const [donorData, setDonorData] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchBloodInfo();
  }, []);

  const fetchBloodInfo = async () => {
    try {
      const response = await api.get('/donors/profile');
      if (response.data.success && response.data.data.donor) {
        setDonorData(response.data.data.donor);
        setSelectedBloodType(response.data.data.donor.nhom_mau || '');
      }
    } catch (error) {
      console.error('Error fetching blood info:', error);
      toast.error('Không thể tải thông tin nhóm máu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBloodType = async () => {
    if (!selectedBloodType) return;

    setUpdating(true);
    try {
      const response = await api.put('/donors/blood-info', { nhom_mau: selectedBloodType });
      if (response.data.success) {
        toast.success('Cập nhật nhóm máu thành công');
        setDonorData(response.data.data.donor);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  const isVerified = !!donorData?.nhom_mau_xac_nhan;
  const bloodType = donorData?.nhom_mau_xac_nhan || donorData?.nhom_mau || 'Chưa cập nhật';

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Thông tin nhóm máu</h1>
        <p className="page-description">Quản lý và cập nhật thông tin nhóm máu của bạn</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Main Blood Type Status */}
        <div className="card" style={{
          marginBottom: 'var(--spacing-xl)',
          overflow: 'hidden',
          border: 'none',
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.15)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            padding: 'var(--spacing-2xl)',
            textAlign: 'center',
            color: 'white',
            position: 'relative'
          }}>
            {/* Decoration Circles */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />

            <h3 style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9, marginBottom: 'var(--spacing-lg)' }}>Nhóm Máu Của Bạn</h3>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              background: 'white',
              borderRadius: '50%',
              color: '#dc2626',
              fontSize: '3.5rem',
              fontWeight: '800',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              {bloodType}
            </div>

            <div>
              {isVerified ? (
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ✅ Đã được xác thực y tế
                </span>
              ) : (
                <span style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: 'var(--font-size-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ⚠️ Chưa được xác thực
                </span>
              )}
            </div>

            {isVerified && (
              <div style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', opacity: 0.8 }}>
                Xác thực bởi {donorData.ten_benh_vien_xac_nhan} • {new Date(donorData.ngay_xac_nhan).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>

          {/* Update Section (Only if unverified) */}
          {!isVerified && (
            <div className="card-body" style={{ padding: 'var(--spacing-xl)' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-xs)' }}>Cập nhật nhóm máu</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Hãy chọn nhóm máu của bạn để chúng tôi có thể gửi thông báo phù hợp.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', maxWidth: '400px', margin: '0 auto var(--spacing-lg)' }}>
                {['O', 'A', 'B', 'AB'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedBloodType(type)}
                    style={{
                      height: '50px',
                      border: selectedBloodType === type ? '2px solid #dc2626' : '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      background: selectedBloodType === type ? '#fef2f2' : 'white',
                      color: selectedBloodType === type ? '#dc2626' : 'var(--text-secondary)',
                      fontWeight: selectedBloodType === type ? 'bold' : 'normal',
                      fontSize: 'var(--font-size-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateBloodType}
                  disabled={updating || !selectedBloodType || selectedBloodType === donorData?.nhom_mau}
                  style={{ minWidth: '200px' }}
                >
                  {updating ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reference Info */}
        <div style={{ marginTop: 'var(--spacing-2xl)' }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'bold',
            marginBottom: 'var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-primary)'
          }}>
            <span style={{ fontSize: '24px' }}>💡</span> Tham khảo: Tương thích nhóm máu
          </h3>

          <div className="card">
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-xl)' }}>
                <div style={{ padding: 'var(--spacing-md)' }}>
                  <h4 style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>Cho máu</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Nhóm O</span> <span>➔ Tất cả các nhóm</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Nhóm A</span> <span>➔ Nhóm A, AB</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Nhóm B</span> <span>➔ Nhóm B, AB</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold' }}>Nhóm AB</span> <span>➔ Nhóm AB</span>
                    </li>
                  </ul>
                </div>

                <div style={{ padding: 'var(--spacing-md)', borderLeft: '1px solid var(--gray-200)' }}>
                  <h4 style={{ color: '#16a34a', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>Nhận máu</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Nhóm O</span> <span>⬅ Nhóm O</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Nhóm A</span> <span>⬅ Nhóm A, O</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Nhóm B</span> <span>⬅ Nhóm B, O</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold' }}>Nhóm AB</span> <span>⬅ Tất cả các nhóm</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default BloodInfo;
