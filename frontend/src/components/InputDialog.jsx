import { useState, useEffect } from 'react';

const InputDialog = ({ isOpen, title, message, placeholder, onConfirm, onCancel, defaultValue = '' }) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setValue(defaultValue);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-lg)'
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          maxWidth: '400px',
          width: '100%',
          backgroundColor: 'white',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body">
          {title && (
            <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-md)' }}>
              {title}
            </h3>
          )}
          {message && (
            <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
              {message}
            </p>
          )}
          <input
            type="text"
            className="form-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            autoFocus
            style={{ marginBottom: 'var(--spacing-lg)' }}
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-outline"
              onClick={onCancel}
            >
              Hủy
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={!value.trim()}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputDialog;

