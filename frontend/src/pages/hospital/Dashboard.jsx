import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eventsRes, bloodTypesRes] = await Promise.all([
        api.get('/hospitals/stats'),
        api.get('/hospitals/events/all?limit=1000'),
        api.get('/hospitals/blood-types/all?limit=1000')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data.events);
      }

      if (bloodTypesRes.data.success) {
        setBloodTypes(bloodTypesRes.data.data.donors);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const startDate = new Date(event.ngay_bat_dau);
      startDate.setHours(0, 0, 0, 0);

      const endDate = event.ngay_ket_thuc ? new Date(event.ngay_ket_thuc) : new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);

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

    if (event.trang_thai === 'tu_choi') {
      return { label: 'Từ chối', className: 'status-badge bg-red-100 text-red-800' };
    }

    return { label: 'Đã kết thúc', className: 'status-da_ket_thuc' };
  };

  // Get selected day events
  const selectedDayEvents = getEventsForDay(date);

  // Get recent pending requests
  const recentRequests = events
    .filter(e => e.trang_thai === 'cho_duyet')
    .sort((a, b) => new Date(b.created_at || b.ngay_bat_dau) - new Date(a.created_at || a.ngay_bat_dau))
    .slice(0, 5);

  // Chart Data - Event Status Distribution
  const eventStatusData = [
    { name: 'Đã duyệt', value: events.filter(e => e.trang_thai === 'da_duyet').length, color: '#10b981' },
    { name: 'Chờ duyệt', value: events.filter(e => e.trang_thai === 'cho_duyet').length, color: '#f59e0b' },
    { name: 'Từ chối', value: events.filter(e => e.trang_thai === 'tu_choi').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Chart Data - Blood Type Distribution
  const bloodTypeCounts = bloodTypes.reduce((acc, curr) => {
    if (curr.nhom_mau) {
      acc[curr.nhom_mau] = (acc[curr.nhom_mau] || 0) + 1;
    }
    return acc;
  }, {});

  const bloodTypeData = [
    { name: 'O', value: bloodTypeCounts['O'] || 0, fill: '#ef4444' },
    { name: 'A', value: bloodTypeCounts['A'] || 0, fill: '#f97316' },
    { name: 'B', value: bloodTypeCounts['B'] || 0, fill: '#3b82f6' },
    { name: 'AB', value: bloodTypeCounts['AB'] || 0, fill: '#8b5cf6' }
  ].filter(item => item.value > 0);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Dashboard Bệnh viện</h1>
        <p className="page-description">
          Chào mừng, {user?.ho_ten}. Quản lý sự kiện và kết quả hiến máu.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '40px' }}>
        <StatCard
          title="Sự kiện chờ duyệt"
          value={stats?.pendingEvents || 0}
          icon="clock"
          color="warning"
          subtitle="Cần xem xét"
        />
        <StatCard
          title="Người hiến máu"
          value={stats?.totalDonors || 0}
          icon="users"
          color="primary"
          subtitle="Đã tham gia"
        />
        <StatCard
          title="Lượng máu"
          value={`${(stats?.bloodCollected || 0).toLocaleString()} ml`}
          icon="droplet"
          color="danger"
          subtitle="Đã thu được"
        />
        <StatCard
          title="Thông báo khẩn cấp"
          value={stats?.notificationsSent || 0}
          icon="bell"
          color="success"
          subtitle="Lượt gửi tới nhóm TN"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col-left">
          {/* Quick Actions */}
          <div className="card" style={{ marginBottom: '40px' }}>
            <div className="card-header">
              <h3 className="card-title">Thao tác nhanh</h3>
            </div>
            <div className="card-body">
              <div className="quick-actions-grid">
                <button
                  className="quick-action-btn btn-warning-gradient"
                  onClick={() => navigate('/hospital/event-approval')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="action-info">
                    <span className="action-title">Duyệt sự kiện</span>
                    <span className="action-desc">{stats?.pendingEvents || 0} yêu cầu chờ duyệt</span>
                  </div>
                </button>

                <button
                  className="quick-action-btn btn-primary-gradient"
                  onClick={() => navigate('/hospital/results')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="action-info">
                    <span className="action-title">Cập nhật kết quả</span>
                    <span className="action-desc">Nhập kết quả hiến máu</span>
                  </div>
                </button>

                <button
                  className="quick-action-btn btn-primary-gradient"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}
                  onClick={() => navigate('/hospital/notifications')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="action-info">
                    <span className="action-title">Gửi thông báo</span>
                    <span className="action-desc">Liên hệ nhóm tình nguyện</span>
                  </div>
                </button>

                <button
                  className="quick-action-btn btn-primary-gradient"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
                  onClick={() => navigate('/hospital/blood-type-confirmation')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="action-info">
                    <span className="action-title">Xác thực nhóm máu</span>
                    <span className="action-desc">Xác nhận sau xét nghiệm</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card" style={{ marginBottom: '40px' }}>
            <div className="card-header">
              <h3 className="card-title">Thống kê trạng thái sự kiện</h3>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {eventStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '40px' }}>
            <div className="card-header">
              <h3 className="card-title">Thống kê nhóm máu (Người hiến)</h3>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bloodTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {bloodTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dashboard-col-right">
          <div className="card h-full">
            <div className="card-header">
              <h3 className="card-title">Lịch hiến máu</h3>
            </div>
            <div className="card-body">
              <Calendar
                onChange={setDate}
                value={date}
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
                          className="dashboard-event-item"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-semibold text-gray-900 text-sm">{evt.ten_su_kien}</h5>
                            <span className={`status-badge ${status.className} px-2 py-0.5`} style={{ fontSize: '10px' }}>
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
                    Không có sự kiện nào
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '40px' }}>
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title">Yêu cầu chờ duyệt</h3>
              <button
                className="text-xs text-primary-600 font-medium hover:text-primary-700 hover:underline"
                onClick={() => navigate('/hospital/event-approval')}
              >
                Xem tất cả
              </button>
            </div>
            <div className="card-body">
              {recentRequests.length > 0 ? (
                <div className="space-y-3">
                  {recentRequests.map(evt => (
                    <div
                      key={evt.id_su_kien}
                      className="dashboard-event-item cursor-pointer hover:shadow-md transition-all"
                      onClick={() => navigate(`/hospital/event-approval`)}
                      style={{ borderLeft: '3px solid #f59e0b', padding: '12px' }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-900 text-sm line-clamp-1">{evt.ten_su_kien}</h5>
                          <p className="text-xs text-gray-500 mt-1">{evt.ten_don_vi}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(evt.ngay_bat_dau).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Không có yêu cầu nào đang chờ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
