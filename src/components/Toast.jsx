import { useEffect } from "react";
import "../styles/toast.css";

const Toast = ({ message, error = false, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000); // auto close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${error ? "toast-error" : "toast-success"}`}>
      {message}
    </div>
  );
};

export default Toast;
