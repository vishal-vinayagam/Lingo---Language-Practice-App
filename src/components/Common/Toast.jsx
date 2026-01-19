import React, { useContext } from "react";
import { ToastContext } from "../../context/ToastContext";
import "./Toast.css";

function Toast() {
  const { toasts } = useContext(ToastContext);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          style={{ "--index": toast.index }}
        >
          <div className="toast-icon">
            {toast.type === "success" && "🟢"}
            {toast.type === "error" && "🟥"}
            {toast.type === "warning" && "🟧"}
            {toast.type === "info" && "🔵"}
          </div>

          <div className="toast-content">
            <p className="toast-message">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Toast;
