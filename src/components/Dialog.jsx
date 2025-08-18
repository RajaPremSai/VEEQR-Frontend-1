import React from "react";
import Modal from "./Modal";
import Button from "./Button";

const Dialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
  className = "",
  ...props
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const dialogClasses = ["dialog", `dialog--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="dialog-icon dialog-icon--danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="dialog-icon dialog-icon--warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.64 21H20.36A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "success":
        return (
          <div className="dialog-icon dialog-icon--success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className="dialog-icon dialog-icon--info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "danger";
      case "warning":
        return "warning";
      case "success":
        return "success";
      default:
        return "primary";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      className={dialogClasses}
      {...props}
    >
      <div className="dialog-content">
        {getIcon()}
        <div className="dialog-text">
          {title && <h3 className="dialog-title">{title}</h3>}
          {message && <p className="dialog-message">{message}</p>}
        </div>
      </div>
      <div className="dialog-actions">
        <Button variant="secondary" onClick={handleCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={getConfirmButtonVariant()}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default Dialog;
