const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  };

  const spinner = (
    <div className={`loading-spinner ${sizeClasses[size]}`}>
      <div className="spinner"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {spinner}
        <p>Đang tải...</p>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

