const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy', confirmButtonColor = 'primary' }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
        }}>
            <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
                <div className="card-header">
                    <h3 className="card-title">{title}</h3>
                </div>
                <div className="card-body">
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{message}</p>
                </div>
                <div className="card-footer" style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`btn btn-${confirmButtonColor}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
