import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const NotificationCreate = () => {
  const navigate = useNavigate();
  const [volunteerGroups, setVolunteerGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id_nhom: '',
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

    if (!formData.id_nhom || !formData.tieu_de || !formData.noi_dung) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/hospitals/notifications', formData);

      if (response.data.success) {
        alert('Gửi thông báo thành công!');
        navigate('/hospital/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
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
          Gửi thông báo đến nhóm tình nguyện
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--spacing-lg)' }}>
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nhóm tình nguyện *</label>
                <select
                  name="id_nhom"
                  className="form-control"
                  value={formData.id_nhom}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn nhóm tình nguyện --</option>
                  {volunteerGroups.map(group => (
                    <option key={group.id_nhom} value={group.id_nhom}>
                      {group.ten_nhom}
                    </option>
                  ))}
                </select>
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
                        <path d="M2 2l12 6-12 6V8l8-2-8-2V2z"/>
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

