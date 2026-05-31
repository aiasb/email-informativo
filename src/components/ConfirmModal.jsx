
export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="confirm-popup">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="confirm-btn-ok" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
