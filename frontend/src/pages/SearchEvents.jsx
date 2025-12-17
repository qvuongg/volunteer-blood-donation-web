import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import HomeHeader from '../components/HomeHeader';
import HomeFooter from '../components/HomeFooter';
import LoadingSpinner from '../components/LoadingSpinner';

const SearchEvents = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('vi');
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    // Get params from URL
    const searchFromUrl = searchParams.get('search') || '';
    const statusFromUrl = searchParams.get('status') || '';
    const dateFromFromUrl = searchParams.get('dateFrom') || '';
    const dateToFromUrl = searchParams.get('dateTo') || '';
    
    setSearchQuery(searchFromUrl);
    setFilters({
      status: statusFromUrl,
      dateFrom: dateFromFromUrl,
      dateTo: dateToFromUrl
    });
    
    fetchEvents(searchFromUrl, statusFromUrl, dateFromFromUrl, dateToFromUrl);
  }, [searchParams]);

  const fetchEvents = async (search = '', status = '', dateFrom = '', dateTo = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await api.get(`/events?${params.toString()}`);
      if (response.data.success) {
        setEvents(response.data.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    setSearchParams(params);
  };

  const handleFindDrive = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    const queryString = params.toString();
    navigate(queryString ? `/search?${queryString}` : '/search');
  };

  const handlePrimaryCta = () => {
    if (user && user.ten_vai_tro === 'nguoi_hien') {
      navigate('/donor/events');
    } else {
      navigate('/register');
    }
  };

  const getTimeStatus = (event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(event.ngay_bat_dau);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(event.ngay_ket_thuc || event.ngay_bat_dau);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) {
      return { label: 'Đã kết thúc', color: '#6b7280' };
    }
    if (startDate > today) {
      return { label: 'Sắp diễn ra', color: '#f59e0b' };
    }
    return { label: 'Đang diễn ra', color: '#10b981' };
  };

  const sortedEvents = [...events].sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endA = new Date(a.ngay_ket_thuc || a.ngay_bat_dau);
    const endB = new Date(b.ngay_ket_thuc || b.ngay_bat_dau);
    endA.setHours(0, 0, 0, 0);
    endB.setHours(0, 0, 0, 0);

    const aEnded = endA < today;
    const bEnded = endB < today;

    if (aEnded !== bEnded) {
      return aEnded ? 1 : -1;
    }

    return endA - endB;
  });

  const activeFiltersCount = [filters.status, filters.dateFrom, filters.dateTo].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HomeHeader
        user={user}
        logout={logout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        language={language}
        setLanguage={setLanguage}
        handleFindDrive={handleFindDrive}
        handlePrimaryCta={handlePrimaryCta}
      />
      
      <div style={{ flex: 1, padding: 'var(--spacing-4xl) calc(var(--spacing-xl) + 200px)', maxWidth: '1400px', margin: '0 auto', width: '100%', padding: 'var(--spacing-2xl) calc(var(--spacing-2xl) + 150px)' }}>
        <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-md)', color: '#1f2937' }}>
            Tìm Kiếm Sự Kiện Hiến Máu
          </h1>
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>
            Tìm kiếm và lọc các sự kiện hiến máu theo nhu cầu của bạn
          </p>
        </div>

        {/* Search and Filters Card */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-2xl)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          marginBottom: 'var(--spacing-3xl)'
        }}>
          <form onSubmit={handleSearch}>
            {/* Main Search */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block', 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: 'var(--font-weight-semibold)', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập địa chỉ, quận/huyện, tên sự kiện, tổ chức, bệnh viện..."
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: '1px solid #d1d5db',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-base)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Advanced Filters */}
            <div style={{
              padding: 'var(--spacing-lg)',
              background: '#f9fafb',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--spacing-md)'
              }}>
                <h3 style={{ 
                  fontSize: 'var(--font-size-lg)', 
                  fontWeight: 'var(--font-weight-semibold)',
                  color: '#111827',
                  margin: 0
                }}>
                  Bộ lọc nâng cao
                </h3>
                {activeFiltersCount > 0 && (
                  <span style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: '#6b7280',
                    background: '#e5e7eb',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {activeFiltersCount} bộ lọc đang áp dụng
                  </span>
                )}
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 'var(--spacing-md)' 
              }}>
                {/* Status Filter */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Trạng thái
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: '1px solid #d1d5db',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Tất cả</option>
                    <option value="dang_dien_ra">Đang diễn ra</option>
                    <option value="sap_dien_ra">Sắp diễn ra</option>
                    <option value="da_ket_thuc">Đã kết thúc</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: '1px solid #d1d5db',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)',
                      background: 'white'
                    }}
                  />
                </div>

                {/* Date To */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 'var(--font-weight-semibold)', 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    min={filters.dateFrom || undefined}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: '1px solid #d1d5db',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)',
                      background: 'white'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: 'var(--spacing-md)', 
                marginTop: 'var(--spacing-lg)',
                justifyContent: 'flex-end'
              }}>
                {(filters.status || filters.dateFrom || filters.dateTo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ status: '', dateFrom: '', dateTo: '' });
                      const params = new URLSearchParams();
                      if (searchQuery.trim()) params.append('search', searchQuery.trim());
                      setSearchParams(params);
                    }}
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-xl)',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontWeight: 'var(--font-weight-medium)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-2xl)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🔍 Tìm kiếm
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-4xl)' }}>
            <LoadingSpinner />
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)' }}>Đang tải sự kiện...</p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-4xl)',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
          }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <rect x="8" y="12" width="48" height="44" rx="4"/>
              <path d="M8 24h48M20 8v8M44 8v8"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
              {searchQuery || activeFiltersCount > 0 ? 'Không tìm thấy sự kiện nào phù hợp' : 'Chưa có sự kiện nào'}
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ status: '', dateFrom: '', dateTo: '' });
                  setSearchParams(new URLSearchParams());
                }}
                className="btn btn-outline"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ 
              marginBottom: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              background: '#eff6ff',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid #3b82f6'
            }}>
              <strong>Tìm thấy {sortedEvents.length} sự kiện</strong>
              {(searchQuery || activeFiltersCount > 0) && (
                <div style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: '#6b7280' }}>
                  {searchQuery && <span>🔍 "{searchQuery}"</span>}
                  {filters.status && <span style={{ marginLeft: 'var(--spacing-sm)' }}>
                    📅 {filters.status === 'dang_dien_ra' ? 'Đang diễn ra' : filters.status === 'sap_dien_ra' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                  </span>}
                  {(filters.dateFrom || filters.dateTo) && (
                    <span style={{ marginLeft: 'var(--spacing-sm)' }}>
                      📆 {filters.dateFrom && filters.dateTo 
                        ? `${new Date(filters.dateFrom).toLocaleDateString('vi-VN')} - ${new Date(filters.dateTo).toLocaleDateString('vi-VN')}`
                        : filters.dateFrom 
                        ? `Từ ${new Date(filters.dateFrom).toLocaleDateString('vi-VN')}`
                        : `Đến ${new Date(filters.dateTo).toLocaleDateString('vi-VN')}`}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 'var(--spacing-xl)'
            }}>
              {sortedEvents.map(event => {
                const status = getTimeStatus(event);
                return (
                  <div
                    key={event.id_su_kien}
                    onClick={() => {
                      if (user && user.ten_vai_tro === 'nguoi_hien') {
                        navigate(`/donor/events/${event.id_su_kien}`);
                      } else {
                        navigate(`/login?returnUrl=/donor/events/${event.id_su_kien}`);
                      }
                    }}
                    style={{
                      background: 'white',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--spacing-xl)',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(220, 38, 38, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                      <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: '#1f2937', flex: 1 }}>
                        {event.ten_su_kien}
                      </h3>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        background: `${status.color}15`,
                        color: status.color,
                        whiteSpace: 'nowrap'
                      }}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 2a4 4 0 00-4 4c0 3 4 6.67 4 6.67S13 9 13 6a4 4 0 00-4-4z"/>
                          <circle cx="9" cy="6" r="1.5"/>
                        </svg>
                        <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                          {event.ten_dia_diem || event.dia_chi || 'Chưa cập nhật địa điểm'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="14" height="12" rx="1"/>
                          <path d="M2 7h14M5 2v4M13 2v4"/>
                        </svg>
                        <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                          {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')} - {event.ngay_ket_thuc ? new Date(event.ngay_ket_thuc).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 9h4M2 12h3M2 6h5M1 15h7a1 1 0 001-1V4a1 1 0 00-1-1H1v12z"/>
                        </svg>
                        <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                          {event.ten_don_vi}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="14" height="10" rx="1"/>
                          <path d="M9 1v2M2 8h14"/>
                        </svg>
                        <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                          {event.ten_benh_vien}
                        </span>
                      </div>
                    </div>

                    {event.so_luong_du_kien && (
                      <div style={{ 
                        padding: 'var(--spacing-sm) var(--spacing-md)', 
                        background: '#fef2f2', 
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          Số lượng dự kiến
                        </span>
                        <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: '#dc2626' }}>
                          {event.so_luong_du_kien} người
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <HomeFooter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleFindDrive={handleFindDrive}
      />
    </div>
  );
};

export default SearchEvents;
