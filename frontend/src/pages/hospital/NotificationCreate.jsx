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

  const [formData, setFormData] = useState({
    selectedGroupIds: [],
    tieu_de: '',
    noi_dung: ''
  });

  const bloodTypeTemplates = {
    urgent_O: {
      tieu_de: 'Khẩn cấp: Cần nhóm máu O',
      noi_dung: 'Bệnh viện đang cần gấp máu nhóm O để cấp cứu bệnh nhân. Kính mong quý nhóm tình nguyện kêu gọi và hỗ trợ liên hệ với chúng tôi ngay.'
    },
    urgent_A: {
      tieu_de: 'Khẩn cấp: Cần nhóm máu A',
      noi_dung: 'Bệnh viện đang cần gấp máu nhóm A để cấp cứu bệnh nhân. Kính mong quý nhóm tình nguyện kêu gọi và hỗ trợ liên hệ với chúng tôi ngay.'
    },
    urgent_B: {
      tieu_de: 'Khẩn cấp: Cần nhóm máu B',
      noi_dung: 'Bệnh viện đang cần gấp máu nhóm B để cấp cứu bệnh nhân. Kính mong quý nhóm tình nguyện kêu gọi và hỗ trợ liên hệ với chúng tôi ngay.'
    },
    urgent_AB: {
      tieu_de: 'Khẩn cấp: Cần nhóm máu AB',
      noi_dung: 'Bệnh viện đang cần gấp máu nhóm AB để cấp cứu bệnh nhân. Kính mong quý nhóm tình nguyện kêu gọi và hỗ trợ liên hệ với chúng tôi ngay.'
    },
    stock_low: {
      tieu_de: 'Thông báo: Kho máu dự trữ đang thấp',
      noi_dung: 'Kho máu dự trữ của bệnh viện đang ở mức thấp. Chúng tôi kêu gọi các mạnh thường quân đến hiến máu tình nguyện. Xin cảm ơn!'
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'var(--spacing-lg)', alignItems: 'flex-start' }}>
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nhóm tình nguyện nhận thông báo *</label>
                <div
                  style={{
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-md)',
                    maxHeight: 260,
                    overflow: 'auto',
                    background: 'var(--gray-50)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--spacing-sm)'
                    }}
                  >
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Đã chọn {formData.selectedGroupIds.length}/{volunteerGroups.length} nhóm
                    </span>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      onClick={handleToggleAllGroups}
                    >
                      {formData.selectedGroupIds.length === volunteerGroups.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {volunteerGroups.map(group => {
                      const checked = formData.selectedGroupIds.includes(group.id_nhom);
                      return (
                        <label
                          key={group.id_nhom}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            borderRadius: 'var(--radius-md)',
                            background: checked ? 'white' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleGroup(group.id_nhom)}
                          />
                          <span style={{ fontSize: 'var(--font-size-sm)' }}>
                            {group.ten_nhom}
                          </span>
                        </label>
                      );
                    })}
                    {volunteerGroups.length === 0 && (
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                        Chưa có nhóm tình nguyện nào.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tiêu đề *</label>
                <input
                  type="text"
                  name="tieu_de"
                  className="form-control"
                  value={formData.tieu_de}
                  onChange={handleChange}
                  placeholder="Ví dụ: Khẩn cấp: Cần nhóm máu O"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung *</label>
                <textarea
                  name="noi_dung"
                  className="form-control"
                  value={formData.noi_dung}
                  onChange={handleChange}
                  rows="8"
                  placeholder="Nhập nội dung thông báo..."
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="small" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 2l12 6-12 6V8l8-2-8-2V2z" />
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Mẫu thông báo</h3>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                Chọn mẫu để tự động điền nội dung:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => applyTemplate('urgent_O')}
                  style={{ justifyContent: 'flex-start' }}
                >
                  🆘 Khẩn cấp - Nhóm O
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => applyTemplate('urgent_A')}
                  style={{ justifyContent: 'flex-start' }}
                >
                  🆘 Khẩn cấp - Nhóm A
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => applyTemplate('urgent_B')}
                  style={{ justifyContent: 'flex-start' }}
                >
                  🆘 Khẩn cấp - Nhóm B
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => applyTemplate('urgent_AB')}
                  style={{ justifyContent: 'flex-start' }}
                >
                  🆘 Khẩn cấp - Nhóm AB
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => applyTemplate('stock_low')}
                  style={{ justifyContent: 'flex-start' }}
                >
                  ⚠️ Kho máu dự trữ thấp
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h4 style={{ marginTop: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                💡 Lưu ý
              </h4>
              <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)' }}>
                <li>Thông báo sẽ được gửi đến nhóm tình nguyện được chọn</li>
                <li>Nội dung nên ngắn gọn, rõ ràng</li>
                <li>Ghi rõ nhóm máu cần thiết nếu có</li>
                <li>Có thể chỉnh sửa mẫu theo nhu cầu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationCreate;

