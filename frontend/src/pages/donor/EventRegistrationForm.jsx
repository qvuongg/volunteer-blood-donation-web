import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const EventRegistrationForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Thông tin cơ bản
    ngay_hien: '',
    khung_gio: '',
    
    // Phiếu đăng ký
    q1_hien_mau_chua: '',
    
    q2_mac_benh: '',
    q2_benh_gi: '',
    
    q3_benh_ly_truoc: '',
    q3_benh_khac: '',
    
    q4_12_thang: [],
    q4_vacxin: '',
    
    q5_6_thang: [],
    q5_details: '',
    
    q6_1_thang: [],
    q6_details: '',
    
    q7_14_ngay: '',
    q7_khac: '',
    
    q8_7_ngay: '',
    q8_khac: ''
  });

  const khungGio = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const currentArray = formData[name] || [];
      if (checked) {
        setFormData({ ...formData, [name]: [...currentArray, value] });
      } else {
        setFormData({ ...formData, [name]: currentArray.filter(item => item !== value) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ngay_hien || !formData.khung_gio) {
      toast.error('Vui lòng chọn ngày và khung giờ hiến máu');
      return;
    }

    // Tổ chức dữ liệu thành cấu trúc JSON đúng
    const phieu_kham_sang_loc = {
      q1: {
        hien_mau_chua: formData.q1_hien_mau_chua
      },
      q2: {
        mac_benh: formData.q2_mac_benh,
        benh_gi: formData.q2_benh_gi || null
      },
      q3: {
        benh_ly_truoc: formData.q3_benh_ly_truoc,
        benh_khac: formData.q3_benh_khac || null
      },
      q4: {
        items: formData.q4_12_thang,
        vacxin: formData.q4_vacxin || null
      },
      q5: {
        items: formData.q5_6_thang
      },
      q6: {
        items: formData.q6_1_thang
      },
      q7: {
        mac_benh: formData.q7_14_ngay,
        khac: formData.q7_khac || null
      },
      q8: {
        dung_thuoc: formData.q8_7_ngay,
        khac: formData.q8_khac || null
      }
    };

    setLoading(true);
    try {
      const response = await api.post(`/registrations/event/${eventId}`, {
        ngay_hen_hien: formData.ngay_hien,
        khung_gio: formData.khung_gio,
        phieu_kham_sang_loc: phieu_kham_sang_loc
      });

      if (response.data.success) {
        toast.success('Đăng ký hiến máu thành công!');
        // Navigate to detail page with the registration ID
        const registrationId = response.data.data.registration.id_dang_ky;
        navigate(`/donor/registrations/${registrationId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-3xl)', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: 'var(--radius-lg)', 
        padding: 'var(--spacing-3xl)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ 
          fontSize: 'var(--font-size-3xl)', 
          fontWeight: 'var(--font-weight-bold)', 
          color: '#dc2626',
          marginBottom: 'var(--spacing-md)',
          textAlign: 'center'
        }}>
          Đăng Ký Hiến Máu
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-3xl)' }}>
          Vui lòng điền đầy đủ thông tin để đăng ký tham gia hiến máu
        </p>

        <form onSubmit={handleSubmit}>
          {/* Thông tin cơ bản */}
          <div style={{ 
            background: 'var(--gray-50)', 
            padding: 'var(--spacing-2xl)', 
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-3xl)'
          }}>
            <h3 style={{ 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--spacing-lg)',
              color: '#111827'
            }}>
              Thông Tin Lịch Hẹn
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
              <div className="form-group">
                <label htmlFor="ngay_hien" className="form-label" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  Chọn ngày hiến máu <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  id="ngay_hien"
                  name="ngay_hien"
                  value={formData.ngay_hien}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="khung_gio" className="form-label" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  Chọn khung giờ <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  id="khung_gio"
                  name="khung_gio"
                  value={formData.khung_gio}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">-- Chọn khung giờ --</option>
                  {khungGio.map((gio, idx) => (
                    <option key={idx} value={gio}>{gio}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Phiếu đăng ký */}
          <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
            <h2 style={{ 
              fontSize: 'var(--font-size-2xl)', 
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--spacing-xl)',
              color: '#dc2626',
              textAlign: 'center',
              paddingBottom: 'var(--spacing-md)',
              borderBottom: '2px solid #dc2626'
            }}>
              Phiếu Đăng Ký Hiến Máu
            </h2>

            {/* Câu hỏi 1 */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)', 
                marginBottom: 'var(--spacing-sm)',
                color: '#111827'
              }}>
                1. Anh/chị từng hiến máu chưa? <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q1_hien_mau_chua"
                    value="co"
                    checked={formData.q1_hien_mau_chua === 'co'}
                    onChange={handleChange}
                    required
                  />
                  <span>Có</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q1_hien_mau_chua"
                    value="khong"
                    checked={formData.q1_hien_mau_chua === 'khong'}
                    onChange={handleChange}
                    required
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>

            {/* Câu hỏi 2 */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)', 
                marginBottom: 'var(--spacing-sm)',
                color: '#111827'
              }}>
                2. Hiện tại, anh/chị có mắc bệnh lý nào không? <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q2_mac_benh"
                    value="co"
                    checked={formData.q2_mac_benh === 'co'}
                    onChange={handleChange}
                    required
                  />
                  <span>Có</span>
                </label>
                {formData.q2_mac_benh === 'co' && (
                  <input
                    type="text"
                    name="q2_benh_gi"
                    value={formData.q2_benh_gi}
                    onChange={handleChange}
                    placeholder="Vui lòng ghi rõ bệnh gì..."
                    className="form-input"
                    style={{ marginLeft: '28px' }}
                  />
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q2_mac_benh"
                    value="khong"
                    checked={formData.q2_mac_benh === 'khong'}
                    onChange={handleChange}
                    required
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>

            {/* Câu hỏi 3 */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)', 
                marginBottom: 'var(--spacing-sm)',
                color: '#111827'
              }}>
                3. Trước đây, anh/chị có từng mắc một trong các bệnh: viêm gan siêu vi B, C, HIV, vảy nến, phì đại tiền liệt tuyến, sốc phản vệ, tai biến mạch máu não, nhồi máu cơ tim, lupus ban đỏ, động kinh, ung thư, hen, được cấy ghép mô tạng? <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q3_benh_ly_truoc"
                    value="co"
                    checked={formData.q3_benh_ly_truoc === 'co'}
                    onChange={handleChange}
                    required
                  />
                  <span>Có</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q3_benh_ly_truoc"
                    value="khong"
                    checked={formData.q3_benh_ly_truoc === 'khong'}
                    onChange={handleChange}
                    required
                  />
                  <span>Không</span>
                </label>
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    Bệnh khác:
                  </label>
                  <input
                    type="text"
                    name="q3_benh_khac"
                    value={formData.q3_benh_khac}
                    onChange={handleChange}
                    placeholder="Nếu có, vui lòng ghi rõ..."
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Câu hỏi 4 */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)', 
                marginBottom: 'var(--spacing-sm)',
                color: '#111827'
              }}>
                4. Trong 12 tháng gần đây, anh/chị có: <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', paddingLeft: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="q4_12_thang"
                    value="khoi_benh"
                    checked={formData.q4_12_thang.includes('khoi_benh')}
                    onChange={handleChange}
                    style={{ marginTop: '4px' }}
                  />
                  <span>Khỏi bệnh sau khi mắc một trong các bệnh: sốt rét, giang mai, lao, viêm não-màng não, uốn ván, phẫu thuật ngoại khoa?</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="q4_12_thang"
                    value="truyen_mau"
                    checked={formData.q4_12_thang.includes('truyen_mau')}
                    onChange={handleChange}
                    style={{ marginTop: '4px' }}
                  />
                  <span>Được truyền máu hoặc các chế phẩm máu?</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="q4_12_thang"
                    value="tiem_vacxin"
                    checked={formData.q4_12_thang.includes('tiem_vacxin')}
                    onChange={handleChange}
                    style={{ marginTop: '4px' }}
                  />
                  <span>Tiêm Vacxin?</span>
                </label>
                {formData.q4_12_thang.includes('tiem_vacxin') && (
                  <input
                    type="text"
                    name="q4_vacxin"
                    value={formData.q4_vacxin}
                    onChange={handleChange}
                    placeholder="Vui lòng ghi rõ loại vacxin..."
                    className="form-input"
                    style={{ marginLeft: '28px' }}
                  />
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="q4_12_thang"
                    value="khong"
                    checked={formData.q4_12_thang.includes('khong')}
                    onChange={handleChange}
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>

            {/* Câu hỏi 5 */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)', 
                marginBottom: 'var(--spacing-sm)',
                color: '#111827'
              }}>
                5. Trong 06 tháng gần đây, anh/chị có: <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', paddingLeft: '20px' }}>
                {[
                  'Khỏi bệnh sau khi mắc một trong các bệnh: thương hàn, nhiễm trùng máu, bị rắn cắn, viêm tắc động mạch, viêm tắc tĩnh mạch, viêm tụy, viêm tủy xương?',
                  'Sút cân nhanh không rõ nguyên nhân?',
                  'Nổi hạch kéo dài?',
                  'Thực hiện thủ thuật y tế xâm lấn (chữa răng, châm cứu, lăn kim, nội soi,..)?',
                  'Xăm, xỏ lỗ tai, lỗ mũi hoặc các vị trí khác trên cơ thể?',
                  'Sử dụng ma túy?',
                  'Tiếp xúc trực tiếp với máu, dịch tiết của người khác hoặc bị thương bởi kim tiêm?',
                  'Sinh sống chung với người nhiễm bệnh Viêm gan siêu vi B?',
                  'Quan hệ tình dục với người nhiễm viêm gan siêu vi B, C, HIV, giang mai hoặc người có nguy cơ nhiễm viêm gan siêu vi B, C, HIV, giang mai?',
                  'Quan hệ tình dục với người cùng giới?'
                ].map((text, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="q5_6_thang"
                      value={`q5_${idx}`}
                      checked={formData.q5_6_thang.includes(`q5_${idx}`)}
                      onChange={handleChange}
                      style={{ marginTop: '4px' }}
                    />
                    <span>{text}</span>
                  </label>
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="q5_6_thang"
                    value="khong"
                    checked={formData.q5_6_thang.includes('khong')}
                    onChange={handleChange}
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>

            {/* Câu hỏi 6 */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)', 
                marginBottom: 'var(--spacing-sm)',
                color: '#111827'
              }}>
                6. Trong 01 tháng gần đây, anh/chị có: <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', paddingLeft: '20px' }}>
                {[
                  'Khỏi bệnh sau khi mắc bệnh viêm đường tiết niệu, viêm da nhiễm trùng, viêm phế quản, viêm phổi, sởi, ho gà, quai bị, sốt xuất huyết, kiết ly, tả, Rubella?',
                  'Đi vào vùng có dịch bệnh lưu hành (sốt rét, sốt xuất huyết, Zika,...)?'
                ].map((text, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="q6_1_thang"
                      value={`q6_${idx}`}
                      checked={formData.q6_1_thang.includes(`q6_${idx}`)}
                      onChange={handleChange}
                      style={{ marginTop: '4px' }}
                    />
                    <span>{text}</span>
                  </label>
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="q6_1_thang"
                    value="khong"
                    checked={formData.q6_1_thang.includes('khong')}
                    onChange={handleChange}
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>

            {/* Câu hỏi 7 */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)', 
                marginBottom: 'var(--spacing-sm)',
                color: '#111827'
              }}>
                7. Trong 14 ngày gần đây, anh/chị có: <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q7_14_ngay"
                    value="co"
                    checked={formData.q7_14_ngay === 'co'}
                    onChange={handleChange}
                    required
                    style={{ marginTop: '4px' }}
                  />
                  <span>Bị cúm, cảm lạnh, ho, nhức đầu, sốt, đau họng?</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q7_14_ngay"
                    value="khong"
                    checked={formData.q7_14_ngay === 'khong'}
                    onChange={handleChange}
                    required
                  />
                  <span>Không</span>
                </label>
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    Khác (cụ thể):
                  </label>
                  <input
                    type="text"
                    name="q7_khac"
                    value={formData.q7_khac}
                    onChange={handleChange}
                    placeholder="Nếu có triệu chứng khác, vui lòng ghi rõ..."
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Câu hỏi 8 */}
            <div className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)', 
                marginBottom: 'var(--spacing-sm)',
                color: '#111827'
              }}>
                8. Trong 07 ngày gần đây, anh/chị có: <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q8_7_ngay"
                    value="co"
                    checked={formData.q8_7_ngay === 'co'}
                    onChange={handleChange}
                    required
                    style={{ marginTop: '4px' }}
                  />
                  <span>Dùng thuốc kháng sinh, kháng viêm, Aspirin, Corticoid?</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="q8_7_ngay"
                    value="khong"
                    checked={formData.q8_7_ngay === 'khong'}
                    onChange={handleChange}
                    required
                  />
                  <span>Không</span>
                </label>
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    Khác (cụ thể):
                  </label>
                  <input
                    type="text"
                    name="q8_khac"
                    value={formData.q8_khac}
                    onChange={handleChange}
                    placeholder="Nếu có sử dụng thuốc khác, vui lòng ghi rõ..."
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-md)', 
            justifyContent: 'center',
            marginTop: 'var(--spacing-3xl)',
            paddingTop: 'var(--spacing-2xl)',
            borderTop: '1px solid var(--gray-200)'
          }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-ghost"
              style={{ minWidth: '150px' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: '150px' }}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký hiến máu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventRegistrationForm;
