import { useEffect } from "react";

export default function Toast({ message, onUndo, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast">
      <span>{message}</span>
      {onUndo && (
        <button className="toast-undo" onClick={onUndo}>
          Undo
        </button>
      )}
    </div>
  );
}
