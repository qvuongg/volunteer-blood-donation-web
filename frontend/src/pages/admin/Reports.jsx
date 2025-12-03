import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ donationsByMonth: [], eventsByMonth: [] });
  const [bloodTypes, setBloodTypes] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const [overviewRes, bloodTypesRes, orgsRes, hospitalsRes] = await Promise.all([
        api.get(`/admin/reports/overview?${params}`),
        api.get('/admin/reports/blood-types'),
        api.get('/admin/reports/organizations'),
        api.get('/admin/reports/hospitals')
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
      }
      if (bloodTypesRes.data.success) {
        setBloodTypes(bloodTypesRes.data.data.bloodTypes);
      }
      if (orgsRes.data.success) {
        setOrganizations(orgsRes.data.data.organizations);
      }
      if (hospitalsRes.data.success) {
        setHospitals(hospitalsRes.data.data.hospitals);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAllReports();
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
        <h1 className="page-title">Báo cáo thống kê</h1>
        <p className="page-description">
          Thống kê và phân tích hoạt động hiến máu
        </p>
      </div>

      {/* Date Filter */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-body">
          <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">Từ ngày</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Đến ngày</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Lọc
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Overview Charts */}
      <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Lượt hiến máu theo tháng</h3>
          </div>
          <div className="card-body">
            {overview.donationsByMonth.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {overview.donationsByMonth.map(item => (
                  <div key={item.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{item.month}</span>
                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                      <span className="badge badge-primary">{item.count} lượt</span>
                      <span className="badge badge-danger">{(item.total_ml || 0).toLocaleString()} ml</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sự kiện theo tháng</h3>
          </div>
          <div className="card-body">
            {overview.eventsByMonth.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {overview.eventsByMonth.map(item => (
                  <div key={item.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{item.month}</span>
                    <span className="badge badge-success">{item.count} sự kiện</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Blood Types Report */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Thống kê theo nhóm máu</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--gray-50)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Nhóm máu</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Tổng người hiến</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Tổng lượt hiến</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Tổng lượng máu (ml)</th>
                </tr>
              </thead>
              <tbody>
                {bloodTypes.map(bt => (
                  <tr key={bt.nhom_mau} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <span className="badge badge-danger">{bt.nhom_mau}</span>
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', fontWeight: 'var(--font-weight-medium)' }}>
                      {bt.total_donors}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                      {bt.total_donations}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', color: 'var(--success-600)', fontWeight: 'var(--font-weight-medium)' }}>
                      {bt.total_ml.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Organizations Report */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Thống kê theo tổ chức</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--gray-50)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Tổ chức</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Sự kiện</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Đăng ký</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Lượt hiến</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Tổng máu (ml)</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map(org => (
                  <tr key={org.id_to_chuc} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: 'var(--spacing-md)', fontWeight: 'var(--font-weight-medium)' }}>
                      {org.ten_don_vi}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                      {org.total_events}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                      {org.total_registrations}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                      {org.total_donations}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', color: 'var(--success-600)', fontWeight: 'var(--font-weight-medium)' }}>
                      {org.total_ml.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hospitals Report */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Thống kê theo bệnh viện</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--gray-50)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Bệnh viện</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Sự kiện</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Đăng ký</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Lượt hiến</th>
                  <th style={{ padding: 'var(--spacing-md)', textAlign: 'right', borderBottom: '1px solid var(--gray-200)' }}>Tổng máu (ml)</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map(hosp => (
                  <tr key={hosp.id_benh_vien} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: 'var(--spacing-md)', fontWeight: 'var(--font-weight-medium)' }}>
                      {hosp.ten_benh_vien}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                      {hosp.total_events}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                      {hosp.total_registrations}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                      {hosp.total_donations}
                    </td>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', color: 'var(--success-600)', fontWeight: 'var(--font-weight-medium)' }}>
                      {hosp.total_ml.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;

