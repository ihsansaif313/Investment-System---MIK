import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = '',
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl lg:max-w-2xl',
    xl: 'max-w-xl sm:max-w-2xl lg:max-w-4xl',
    full: 'max-w-full',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 lg:p-6">
        <div
          className={`
            relative w-full ${sizeClasses[size]}
            bg-slate-800 rounded-lg sm:rounded-xl shadow-xl
            transform transition-all duration-200
            max-h-[90vh] flex flex-col
            ${className}
          `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
              {title && (
                <h3 className="text-base sm:text-lg font-semibold text-white pr-4 truncate">
                  {title}
                </h3>
              )}

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700 flex-shrink-0"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-slate-700 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const variantStyles = {
    danger: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'warning' as const,
    info: 'primary' as const,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className={`text-slate-300 ${variantStyles[variant]}`}>
        {message}
      </p>
    </Modal>
  );
};

export default Modal;
