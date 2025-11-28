import React, { useState, useEffect } from 'react';
import '../styles/Toast.css';

let toastQueue = [];
let setToastsCallback = null;

export function showToast(message, type = 'info') {
  const toast = {
    id: Date.now() + Math.random(),
    message,
    type // 'success', 'error', 'warning', 'info'
  };
  
  toastQueue.push(toast);
  if (setToastsCallback) {
    setToastsCallback([...toastQueue]);
  }
  
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== toast.id);
    if (setToastsCallback) {
      setToastsCallback([...toastQueue]);
    }
  }, 4000);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    setToastsCallback = setToasts;
    return () => {
      setToastsCallback = null;
    };
  }, []);
  
  const removeToast = (id) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    setToasts([...toastQueue]);
  };
  
  const getIcon = (type) => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };
  
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-icon">{getIcon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
