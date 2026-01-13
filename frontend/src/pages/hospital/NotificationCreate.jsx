import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const NotificationCreate = () => {
  const navigate = useNavigate();
  const { error: toastError, success, warning } = useToast();
  const [volunteerGroups, setVolunteerGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    selectedGroupIds: [],
    tieu_de: '',
    noi_dung: ''
  });

  const bloodTypeTemplates = {
    urgent_O: {
      tieu_de: 'Khẩn cấp: Cần nhóm máu O',
      noi_dung: 'Bệnh viện đang cần gấp máu nhóm O để cấp cứu bệnh nhân. Kính mong quý nhóm tình nguyện kêu gọi và hỗ trợ liên hệ với chúng tôi ngay.',
      style: { background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' },
      label: 'Khẩn cấp - Nhóm O'
    },
    urgent_A: {
      tieu_de: 'Khẩn cấp: Cần nhóm máu A',
      noi_dung: 'Bệnh viện đang cần gấp máu nhóm A để cấp cứu bệnh nhân. Kính mong quý nhóm tình nguyện kêu gọi và hỗ trợ liên hệ với chúng tôi ngay.',
      style: { background: '#fff7ed', color: '#ea580c', borderColor: '#fed7aa' },
      label: 'Khẩn cấp - Nhóm A'
    },
    urgent_B: {
      tieu_de: 'Khẩn cấp: Cần nhóm máu B',
      noi_dung: 'Bệnh viện đang cần gấp máu nhóm B để cấp cứu bệnh nhân. Kính mong quý nhóm tình nguyện kêu gọi và hỗ trợ liên hệ với chúng tôi ngay.',
      style: { background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' },
      label: 'Khẩn cấp - Nhóm B'
    },
    urgent_AB: {
      tieu_de: 'Khẩn cấp: Cần nhóm máu AB',
      noi_dung: 'Bệnh viện đang cần gấp máu nhóm AB để cấp cứu bệnh nhân. Kính mong quý nhóm tình nguyện kêu gọi và hỗ trợ liên hệ với chúng tôi ngay.',
      style: { background: '#faf5ff', color: '#9333ea', borderColor: '#e9d5ff' },
      label: 'Khẩn cấp - Nhóm AB'
    },
    stock_low: {
      tieu_de: 'Thông báo: Kho máu dự trữ đang thấp',
      noi_dung: 'Kho máu dự trữ của bệnh viện đang ở mức thấp. Chúng tôi kêu gọi các mạnh thường quân đến hiến máu tình nguyện. Xin cảm ơn!',
      style: { background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' },
      label: 'Kho máu dự trữ thấp'
    }
  };

  useEffect(() => {
    fetchVolunteerGroups();
  }, []);

  const fetchVolunteerGroups = async () => {
    try {
      // TODO: Create API to get volunteer groups
      // For now use placeholder
      setVolunteerGroups([
        { id_nhom: 1, ten_nhom: 'Nhóm Tình Nguyện Hiến Máu Xanh' },
        { id_nhom: 2, ten_nhom: 'Nhóm Tình Nguyện Trẻ Đà Nẵng' }
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleGroup = (groupId) => {
    setFormData(prev => {
      const exists = prev.selectedGroupIds.includes(groupId);
      return {
        ...prev,
        selectedGroupIds: exists
          ? prev.selectedGroupIds.filter(id => id !== groupId)
          : [...prev.selectedGroupIds, groupId]
      };
    });
  };

  const handleToggleAllGroups = () => {
    setFormData(prev => ({
      ...prev,
      selectedGroupIds:
        prev.selectedGroupIds.length === volunteerGroups.length
          ? []
          : volunteerGroups.map(g => g.id_nhom)
    }));
  };

  const applyTemplate = (templateKey) => {
    const template = bloodTypeTemplates[templateKey];
    setFormData(prev => ({
      ...prev,
      tieu_de: template.tieu_de,
      noi_dung: template.noi_dung
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tieu_de || !formData.noi_dung || formData.selectedGroupIds.length === 0) {
      warning('Vui lòng chọn ít nhất một nhóm và điền đầy đủ thông tin');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id_nhoms: formData.selectedGroupIds,
        // Giữ id_nhom đầu tiên để tương thích backend cũ (nếu cần)
        id_nhom: formData.selectedGroupIds[0],
        tieu_de: formData.tieu_de,
        noi_dung: formData.noi_dung
      };

      const response = await api.post('/hospitals/notifications', payload);

      if (response.data.success) {
        success('Gửi thông báo thành công!');
        navigate('/hospital/dashboard');
      }
    } catch (error) {
      toastError(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const filteredGroups = volunteerGroups.filter(g =>
    g.ten_nhom.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="page-title">Tạo thông báo</h1>
        <p className="page-description">
          Gửi thông báo khẩn cấp đến một hoặc nhiều nhóm tình nguyện.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
        {/* Left Column: Form */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>

              {/* Group Selection */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                  <label className="form-label mb-0">Nhóm tình nguyện <span style={{ color: 'var(--danger-500)' }}>*</span></label>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Đã chọn: <b>{formData.selectedGroupIds.length}</b>
                  </span>
                </div>

                <div style={{
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    background: 'var(--gray-50)',
                    borderBottom: '1px solid var(--gray-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-md)'
                  }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}
                      >
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Tìm kiếm nhóm..."
                        style={{ paddingLeft: '34px', height: '36px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={handleToggleAllGroups}
                      style={{ color: 'var(--primary-600)' }}
                    >
                      {formData.selectedGroupIds.length === volunteerGroups.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto', padding: 'var(--spacing-sm)' }}>
                    {filteredGroups.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
                        {filteredGroups.map(group => {
                          const isSelected = formData.selectedGroupIds.includes(group.id_nhom);
                          return (
                            <label
                              key={group.id_nhom}
                              onClick={() => handleToggleGroup(group.id_nhom)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: `1px solid ${isSelected ? 'var(--primary-200)' : 'var(--gray-200)'}`,
                                background: isSelected ? 'var(--primary-50)' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{
                                width: '20px', height: '20px', borderRadius: '4px',
                                border: `1px solid ${isSelected ? 'var(--primary-600)' : 'var(--gray-300)'}`,
                                background: isSelected ? 'var(--primary-600)' : 'white',
                                marginRight: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {isSelected && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                              </div>
                              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: isSelected ? '600' : '400', color: isSelected ? 'var(--primary-900)' : 'var(--text-primary)' }}>
                                {group.ten_nhom}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: 'var(--font-size-sm)' }}>Không tìm thấy nhóm phù hợp</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Content */}
              <div className="form-group">
                <label className="form-label">Tiêu đề thông báo <span style={{ color: 'var(--danger-500)' }}>*</span></label>
                <input
                  type="text"
                  name="tieu_de"
                  className="form-input"
                  style={{ fontWeight: 'bold' }}
                  value={formData.tieu_de}
                  onChange={handleChange}
                  placeholder="Ví dụ: Khẩn cấp: Cần nhóm máu O"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung chi tiết <span style={{ color: 'var(--danger-500)' }}>*</span></label>
                <textarea
                  name="noi_dung"
                  rows="6"
                  className="form-textarea"
                  value={formData.noi_dung}
                  onChange={handleChange}
                  placeholder="Nhập nội dung thông báo..."
                  required
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--gray-200)' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ minWidth: '140px' }}
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="small" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Gửi thông báo
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/hospital/dashboard')}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Templates & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

          {/* Quick Templates */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ background: 'var(--gray-50)', padding: 'var(--spacing-md) var(--spacing-lg)', marginBottom: 0, borderBottom: '1px solid var(--gray-100)' }}>
              <h3 className="card-title" style={{ fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Mẫu thông báo
              </h3>
            </div>
            <div className="card-body" style={{ padding: 'var(--spacing-md)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                Chọn mẫu để điền nhanh nội dung:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {Object.entries(bloodTypeTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyTemplate(key)}
                    className="btn"
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      width: '100%',
                      background: template.style.background,
                      color: template.style.color,
                      border: `1px solid ${template.style.borderColor}`,
                      padding: '12px 16px',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    <span style={{ flex: 1 }}>{template.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Guide */}
          <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <div className="card-body" style={{ marginBottom: 0 }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: '#1e40af', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Lưu ý
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: 'var(--font-size-sm)', color: '#1e3a8a', lineHeight: '1.6' }}>
                <li>Thông báo sẽ được gửi qua Email/SMS đến trưởng nhóm.</li>
                <li>Nội dung cần ngắn gọn, rõ ràng.</li>
                <li>Vui lòng kiểm tra kỹ trước khi gửi.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default NotificationCreate;
