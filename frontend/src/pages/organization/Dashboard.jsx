import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, myEventsRes, publicEventsRes] = await Promise.all([
        api.get('/organizations/stats'),
        api.get('/organizations/events?limit=1000'),
        api.get('/events?limit=1000') // Public events
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      let allEvents = [];
      if (myEventsRes.data.success) {
        allEvents = myEventsRes.data.data.events.map(e => ({ ...e, isMine: true }));
      }

      if (publicEventsRes.data.success) {
        // Merge public events, avoiding duplicates
        const existingIds = new Set(allEvents.map(e => e.id_su_kien));
        publicEventsRes.data.data.events.forEach(evt => {
          if (!existingIds.has(evt.id_su_kien)) {
            allEvents.push(evt);
          }
        });
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to find events on a specific day (checking range)
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const startDate = new Date(event.ngay_bat_dau);
      startDate.setHours(0, 0, 0, 0);

      const endDate = event.ngay_ket_thuc ? new Date(event.ngay_ket_thuc) : new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0); // Avoid timezone edge cases

      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDay(date);
      if (dayEvents.length > 0) {
        return 'highlight-event-tile';
      }
    }
  };

  const chartData = stats ? [
    { name: 'Đã duyệt', value: parseInt(stats.approvedRegistrations), color: '#10B981' }, // success color
    { name: 'Chờ duyệt', value: parseInt(stats.pendingApprovals), color: '#F59E0B' },   // warning color
  ] : [];

  const COLORS = ['#10B981', '#F59E0B'];

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  // Helper to determine event status label and class
  const getEventStatus = (event) => {
    if (event.trang_thai === 'cho_duyet') {
      return { label: 'Chờ duyệt', className: 'status-cho_duyet' };
    }

    if (event.trang_thai === 'da_duyet') {
      const now = new Date();
      const startDate = new Date(event.ngay_bat_dau);
      startDate.setHours(0, 0, 0, 0);

      const endDate = event.ngay_ket_thuc ? new Date(event.ngay_ket_thuc) : new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      if (now < startDate) {
        return { label: 'Sắp diễn ra', className: 'status-sap_dien_ra' };
      } else if (now >= startDate && now <= endDate) {
        return { label: 'Đang diễn ra', className: 'status-dang_dien_ra' };
      } else {
        return { label: 'Đã kết thúc', className: 'status-da_ket_thuc' };
      }
    }

    // Fallback for other statuses (e.g. tu_choi, da_huy)
    return { label: 'Đã kết thúc', className: 'status-da_ket_thuc' };
  };

  const selectedDayEvents = getEventsForDay(value);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Dashboard Tổ chức</h1>
        <p className="page-description">
          Chào mừng, {user?.ho_ten}. Quản lý sự kiện hiến máu của tổ chức bạn.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '40px' }}>
        <StatCard
          title="Sự kiện"
          value={stats?.totalEvents || 0}
          icon="calendar"
          color="primary"
          subtitle="Tổng sự kiện"
        />
        <StatCard
          title="Chờ duyệt"
          value={stats?.pendingApprovals || 0}
          icon="clock"
          color="warning"
          subtitle="Đăng ký chờ duyệt"
        />
        <StatCard
          title="Đã duyệt"
          value={stats?.approvedRegistrations || 0}
          icon="check"
          color="success"
          subtitle="Đăng ký đã duyệt"
        />
        <StatCard
          title="Người tham gia"
          value={stats?.totalParticipants || 0}
          icon="users"
          color="secondary"
          subtitle="Tổng số người"
        />
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Quick Actions & Chart */}
        <div className="dashboard-col-left">

          <div className="card" style={{ marginBottom: '40px' }}>
            <div className="card-header">
              <h3 className="card-title">Thao tác nhanh</h3>
            </div>
            <div className="card-body">
              <div className="quick-actions-grid">
                <button
                  className="quick-action-btn btn-primary-gradient"
                  onClick={() => navigate('/organization/events/new')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <div className="action-info">
                    <span className="action-title">Tạo sự kiện mới</span>
                    <span className="action-desc">Lên lịch tổ chức hiến máu</span>
                  </div>
                </button>

                <button
                  className="quick-action-btn btn-warning-gradient"
                  onClick={() => navigate('/organization/approvals')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </div>
                  <div className="action-info">
                    <span className="action-title">Duyệt đăng ký</span>
                    <span className="action-desc">Xử lý {stats?.pendingApprovals || 0} hồ sơ</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '40px' }}>
            <div className="card-header">
              <h3 className="card-title">Tỷ lệ duyệt hồ sơ</h3>
            </div>
            <div className="card-body flex justify-center items-center" style={{ height: '300px' }}>
              {chartData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} hồ sơ`]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500">Chưa có dữ liệu đăng ký</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Calendar */}
        <div className="dashboard-col-right">
          <div className="card h-full">
            <div className="card-header">
              <h3 className="card-title">Lịch hiến máu</h3>
            </div>
            <div className="card-body">
              <Calendar
                onChange={setValue}
                value={value}
                tileClassName={tileClassName}
                className="custom-calendar"
              />

              <div className="selected-date-events mt-4">
                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayEvents.map(evt => {
                      const status = getEventStatus(evt);
                      return (
                        <div
                          key={evt.id_su_kien}
                          className={`dashboard-event-item ${evt.isMine ? 'cursor-pointer' : ''}`}
                          onClick={() => evt.isMine && navigate(`/organization/events/${evt.id_su_kien}`)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-semibold text-gray-900 text-sm">{evt.ten_su_kien}</h5>
                            <span className={`status-badge ${status.className} px-2 py-0.5`} style={{ fontSize: '12px' }}>
                              {status.label}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium text-gray-500">Tại:</span> {evt.ten_dia_diem}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    Không có sự kiện nào trong ngày này
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
