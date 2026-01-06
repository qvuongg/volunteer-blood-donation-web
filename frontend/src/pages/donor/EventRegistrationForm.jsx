import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const EventRegistrationForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [event, setEvent] = useState(null);
  const [validationError, setValidationError] = useState('');
  
  // Refs for scrolling to questions
  const questionRefs = {
    q1: useRef(null),
    q2: useRef(null),
    q3: useRef(null),
    q4: useRef(null),
    q5: useRef(null),
    q6: useRef(null),
    q7: useRef(null),
    q8: useRef(null),
    basicInfo: useRef(null)
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      if (response.data.success) {
        setEvent(response.data.data.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast?.error('Không thể tải thông tin sự kiện');
    } finally {
      setLoadingEvent(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
    
    // Clear validation error when user starts typing/selecting
    if (validationError) {
      setValidationError('');
    }
    
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

  const validateForm = () => {
    setValidationError('');
    
    // Validate basic info
    if (!formData.ngay_hien || !formData.khung_gio) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.basicInfo.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    // Validate Q1
    if (!formData.q1_hien_mau_chua) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q1.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    // Validate Q2
    if (!formData.q2_mac_benh) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q2.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (formData.q2_mac_benh === 'co' && !formData.q2_benh_gi?.trim()) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q2.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    // Validate Q3
    if (!formData.q3_benh_ly_truoc) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q3.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    // Validate Q4 - must have at least one checkbox selected
    if (!formData.q4_12_thang || formData.q4_12_thang.length === 0) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q4.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (formData.q4_12_thang.includes('Tiêm Vacxin?') && !formData.q4_vacxin?.trim()) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q4.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    // Validate Q5 - must have at least one checkbox selected
    if (!formData.q5_6_thang || formData.q5_6_thang.length === 0) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q5.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    // Validate Q6 - must have at least one checkbox selected
    if (!formData.q6_1_thang || formData.q6_1_thang.length === 0) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q6.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    // Validate Q7
    if (!formData.q7_14_ngay) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q7.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    // Validate Q8
    if (!formData.q8_7_ngay) {
      setValidationError('Không được điền thiếu dữ liệu');
      questionRefs.q8.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
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

  if (loadingEvent) {
    return (
      <div style={{ padding: 'var(--spacing-3xl)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-2xl)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with back button */}
      <div style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            background: 'white',
            border: '1px solid var(--gray-300)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-base)',
            color: 'var(--text-primary)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--gray-50)';
            e.currentTarget.style.borderColor = 'var(--gray-400)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = 'var(--gray-300)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15l-5-5 5-5"/>
          </svg>
          Quay lại
        </button>
        <h1 style={{ 
          fontSize: 'var(--font-size-2xl)', 
          fontWeight: 'var(--font-weight-bold)', 
          color: '#dc2626',
          margin: 0
        }}>
          Đăng Ký Hiến Máu
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 'var(--spacing-2xl)' }}>
        {/* Left Sidebar - Event Information */}
        <div style={{ 
          position: 'sticky',
          top: 'var(--spacing-xl)',
          height: 'fit-content',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-2xl)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid var(--gray-200)'
        }}>
          {event ? (
            <>
              <div style={{
                background: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)',
                textAlign: 'center'
              }}>
                <h2 style={{ 
                  fontSize: 'var(--font-size-xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: '#111827',
                  margin: '0 0 var(--spacing-sm) 0'
                }}>
                  {event.ten_su_kien}
                </h2>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: '#6B7280',
                  marginTop: 'var(--spacing-xs)'
                }}>
                  Sự kiện hiến máu
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <div>
                  <label style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--text-secondary)', 
                    display: 'block', 
                    marginBottom: 'var(--spacing-xs)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    Tổ chức
                  </label>
                  <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                    {event.ten_don_vi}
                  </p>
                </div>

                <div>
                  <label style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--text-secondary)', 
                    display: 'block', 
                    marginBottom: 'var(--spacing-xs)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    Bệnh viện
                  </label>
                  <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                    {event.ten_benh_vien}
                  </p>
                </div>

                <div>
                  <label style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--text-secondary)', 
                    display: 'block', 
                    marginBottom: 'var(--spacing-xs)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    Thời gian
                  </label>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    <strong>Bắt đầu:</strong> {formatDate(event.ngay_bat_dau)}
                  </p>
                  <p style={{ margin: 'var(--spacing-xs) 0 0', fontSize: 'var(--font-size-sm)' }}>
                    <strong>Kết thúc:</strong> {formatDate(event.ngay_ket_thuc)}
                  </p>
                </div>

                <div>
                  <label style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--text-secondary)', 
                    display: 'block', 
                    marginBottom: 'var(--spacing-xs)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    Địa điểm
                  </label>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    {event.ten_dia_diem || 'Chưa cập nhật'}
                  </p>
                  {event.dia_chi && (
                    <p style={{ margin: 'var(--spacing-xs) 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {event.dia_chi}
                    </p>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-md)',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  marginTop: 'var(--spacing-sm)'
                }}>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Số lượng dự kiến
                    </div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: '#dc2626' }}>
                      {event.so_luong_du_kien || 0} người
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Đã đăng ký
                    </div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: '#059669' }}>
                      {event.so_luong_dang_ky || 0} người
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
              Không thể tải thông tin sự kiện
            </div>
          )}
        </div>

        {/* Right Side - Registration Form */}
        <div style={{ 
          background: 'white', 
          borderRadius: 'var(--radius-lg)', 
          padding: 'var(--spacing-3xl)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid var(--gray-200)'
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2xl)', fontSize: 'var(--font-size-base)' }}>
            Vui lòng điền đầy đủ thông tin để đăng ký tham gia hiến máu
          </p>

        <form onSubmit={handleSubmit}>
          {/* Thông tin cơ bản */}
          <div 
            ref={questionRefs.basicInfo}
            style={{ 
              background: 'var(--gray-50)', 
              padding: 'var(--spacing-2xl)', 
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-3xl)'
            }}
          >
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
            <div ref={questionRefs.q1} className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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
            <div ref={questionRefs.q2} className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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
            <div ref={questionRefs.q3} className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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
            <div ref={questionRefs.q4} className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'var(--font-weight-semibold)', 
                marginBottom: 'var(--spacing-sm)',
                color: '#111827'
              }}>
                4. Trong 12 tháng gần đây, anh/chị có: <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', paddingLeft: '20px' }}>
                {[
                  'Khỏi bệnh sau khi mắc một trong các bệnh: sốt rét, giang mai, lao, viêm não-màng não, uốn ván, phẫu thuật ngoại khoa?',
                  'Được truyền máu hoặc các chế phẩm máu?',
                  'Tiêm Vacxin?'
                ].map((text, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="q4_12_thang"
                      value={text}
                      checked={formData.q4_12_thang.includes(text)}
                      onChange={handleChange}
                      style={{ marginTop: '4px' }}
                    />
                    <span>{text}</span>
                  </label>
                ))}
                {formData.q4_12_thang.includes('Tiêm Vacxin?') && (
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
            <div ref={questionRefs.q5} className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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
                      value={text}
                      checked={formData.q5_6_thang.includes(text)}
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
            <div ref={questionRefs.q6} className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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
                      value={text}
                      checked={formData.q6_1_thang.includes(text)}
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
            <div ref={questionRefs.q7} className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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
            <div ref={questionRefs.q8} className="form-group" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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

          {/* Validation Error Message */}
          {validationError && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md)',
              marginTop: 'var(--spacing-xl)',
              textAlign: 'center'
            }}>
              <p style={{ 
                margin: 0, 
                color: '#DC2626', 
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-base)'
              }}>
                {validationError}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-md)', 
            justifyContent: 'flex-end',
            marginTop: 'var(--spacing-3xl)',
            paddingTop: 'var(--spacing-2xl)',
            borderTop: '1px solid var(--gray-200)'
          }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
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
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng ký hiến máu'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationForm;
