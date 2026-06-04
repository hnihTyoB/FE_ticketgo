import React, { useState, useEffect, useCallback } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

interface AuthContainerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialMode]);

  const handleSwitchToLogin = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode('login');
      setIsTransitioning(false);
    }, 150);
  }, []);

  const handleSwitchToRegister = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode('register');
      setIsTransitioning(false);
    }, 150);
  }, []);

  const handleClose = useCallback(() => {
    setIsTransitioning(false);
    setTimeout(() => {
      setAuthMode('login');
    }, 300);
    onClose();
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isTransitioning) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1050] p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'} w-full max-w-md`}>
        {authMode === 'login' ? (
          <LoginModal
            isOpen={true}
            onClose={handleClose}
            onSwitchToRegister={handleSwitchToRegister}
          />
        ) : (
          <RegisterModal
            isOpen={true}
            onClose={handleClose}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default AuthContainer;