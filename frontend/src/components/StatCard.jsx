const StatCard = ({ title, value, icon, color = 'primary', trend, subtitle }) => {
  const getIcon = (iconName) => {
    const icons = {
      users: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M24 28v-2.667A5.333 5.333 0 0018.667 20H13.333A5.333 5.333 0 008 25.333V28M21.333 9.333A5.333 5.333 0 1116 4a5.333 5.333 0 015.333 5.333z"/>
        </svg>
      ),
      heart: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M27.84 6.867a6.4 6.4 0 00-9.067 0L16 9.653l-2.773-2.786a6.4 6.4 0 10-9.067 9.066L16 27.773l11.84-11.84a6.4 6.4 0 000-9.066z"/>
        </svg>
      ),
      droplet: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4s-10 11.667-10 16.667A10 10 0 0026 20.667C26 15.667 16 4 16 4z"/>
        </svg>
      ),
      calendar: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="6.667" width="24" height="21.333" rx="2.667"/>
          <path d="M4 13.333h24M10.667 4v5.333M21.333 4v5.333"/>
        </svg>
      ),
      check: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M26.667 8L12 22.667 5.333 16" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      clock: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="16" cy="16" r="12"/>
          <path d="M16 8v8l4 4" strokeLinecap="round"/>
        </svg>
      ),
    };
    return icons[iconName] || icons.heart;
  };

  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-content">
        <div className="stat-card-text">
          <p className="stat-card-title">{title}</p>
          <h3 className="stat-card-value">{value}</h3>
          {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
          {trend && (
            <div className={`stat-card-trend ${trend.type}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                {trend.type === 'up' ? (
                  <path d="M8 4l4 4H9v4H7V8H4l4-4z"/>
                ) : (
                  <path d="M8 12l-4-4h3V4h2v4h3l-4 4z"/>
                )}
              </svg>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className="stat-card-icon">
          {getIcon(icon)}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

