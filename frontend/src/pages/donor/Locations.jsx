import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      if (response.data.success) {
        setLocations(response.data.data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(loc =>
    loc.ten_dia_diem.toLowerCase().includes(search.toLowerCase()) ||
    (loc.dia_chi && loc.dia_chi.toLowerCase().includes(search.toLowerCase()))
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
        <h1 className="page-title">Địa điểm hiến máu</h1>
        <p className="page-description">
          Tìm kiếm địa điểm hiến máu gần bạn
        </p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card-body">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {filteredLocations.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <path d="M32 8a16 16 0 00-16 16c0 12 16 26.67 16 26.67s16-14.67 16-26.67a16 16 0 00-16-16z"/>
              <circle cx="32" cy="24" r="5"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              {search ? 'Không tìm thấy địa điểm nào' : 'Chưa có địa điểm nào'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {filteredLocations.map(location => (
            <div key={location.id_dia_diem} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--primary-50)',
                    color: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3a8 8 0 00-8 8c0 6 8 13.33 8 13.33s8-7.33 8-13.33a8 8 0 00-8-8z"/>
                      <circle cx="12" cy="11" r="3"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 'var(--font-size-lg)' }}>
                      {location.ten_dia_diem}
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                      {location.dia_chi}
                    </p>
                  </div>
                </div>
                
                {(location.vi_do && location.kinh_do) && (
                  <div style={{ 
                    marginTop: 'var(--spacing-md)', 
                    paddingTop: 'var(--spacing-md)', 
                    borderTop: '1px solid var(--gray-200)' 
                  }}>
                    <a
                      href={`https://www.google.com/maps?q=${location.vi_do},${location.kinh_do}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                      style={{ width: '100%' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 2a5 5 0 00-5 5c0 3.75 5 8.33 5 8.33s5-4.58 5-8.33a5 5 0 00-5-5z"/>
                        <circle cx="8" cy="7" r="1.5"/>
                      </svg>
                      Xem trên bản đồ
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Locations;
