import React, { useState, useEffect, useRef } from "react";
import { X, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import type { LoginCredentials } from "../../constants/types/types";
// @ts-expect-error - JSX file without type declarations
import { useAuth } from "../../contexts/AuthContext";
import axios from "@/utils/axiosInterceptor";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}
const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
}) => {
  const { login, refreshPendingOrdersCount } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginCredentials>({
    emailOrPhone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showSuccess, setShowSuccess] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/auth/login", {
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
      });

      if (!response.data || !response.data.user) {
        throw new Error("Phản hồi từ server không hợp lệ");
      }

      const { user, token } = response.data;
      login(user, token);
      refreshPendingOrdersCount();

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setFormData({ emailOrPhone: "", password: "" });
        setValidationErrors({});

        if (user.role?.name === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      if (err.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        err.response.data.errors.forEach((error: any) => {
          if (error.path === "emailOrPhone")
            backendErrors.emailOrPhone = error.message;
          else if (error.path === "password")
            backendErrors.password = error.message;
        });
        setValidationErrors(backendErrors);
      } else {
        alert(
          "Lỗi: " +
          (err.response?.data?.message ||
            err.response?.data?.error ||
            err.message)
        );
      }
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="bg-white rounded-2xl w-full shadow-2xl transform transition-all"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all"
      >
        {/* Tiêu đề */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <h2 id="login-modal-title" className="text-white text-2xl font-bold">
            Đăng nhập
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-full hover:bg-white/10"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Biểu mẫu */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          {/* Thông báo thành công */}
          {showSuccess && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Đăng nhập thành công!</span>
            </div>
          )}

          {/* Ô nhập Email/SĐT */}
          <div>
            <label
              htmlFor="emailOrPhone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email hoặc Số điện thoại
            </label>
            <input
              ref={emailInputRef}
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleInputChange}
              placeholder="Nhập email hoặc số điện thoại"
              autoComplete="username"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${validationErrors.emailOrPhone
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-green-500 focus:border-transparent"
                }`}
              disabled={isSubmitting}
              aria-invalid={!!validationErrors.emailOrPhone}
              aria-describedby={
                validationErrors.emailOrPhone ? "emailOrPhone-error" : undefined
              }
            />
            {validationErrors.emailOrPhone && (
              <div
                id="emailOrPhone-error"
                className="flex items-center space-x-1 text-red-600 text-sm mt-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.emailOrPhone}</span>
              </div>
            )}
          </div>

          {/* Ô nhập mật khẩu */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu của bạn"
                autoComplete="current-password"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-12 ${validationErrors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-500 focus:border-transparent"
                  }`}
                disabled={isSubmitting}
                aria-invalid={!!validationErrors.password}
                aria-describedby={
                  validationErrors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 p-1"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <div
                id="password-error"
                className="flex items-center space-x-1 text-red-600 text-sm mt-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.password}</span>
              </div>
            )}
          </div>

          {/* Nút gửi */}
          <button
            type="submit"
            disabled={isSubmitting || showSuccess}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting
              ? "Đang xử lý..."
              : showSuccess
                ? "Thành công!"
                : "Đăng nhập"}
          </button>

          {/* Trạng thái tải */}
          {isSubmitting && (
            <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <div className="animate-spin w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full"></div>
              <span className="font-medium">Đang xác minh thông tin...</span>
            </div>
          )}

          {/* Quên mật khẩu */}
          <div className="text-center">
            <a
              href="#"
              className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors hover:underline"
              tabIndex={isSubmitting ? -1 : 0}
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Liên kết đăng ký */}
          <div className="text-center">
            <span className="text-gray-600 text-sm">Chưa có tài khoản? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              disabled={isSubmitting}
              className="text-green-600 font-semibold hover:text-green-700 transition-colors hover:underline disabled:opacity-50 text-sm"
            >
              Đăng ký ngay
            </button>
          </div>

          {/* Điều khoản và chính sách */}
          <div className="text-xs text-gray-500 text-center leading-relaxed pt-2">
            Bằng việc đăng nhập, bạn đã đọc và đồng ý với{" "}
            <a
              href="#"
              className="text-green-600 hover:underline font-medium"
              tabIndex={isSubmitting ? -1 : 0}
            >
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a
              href="#"
              className="text-green-600 hover:underline font-medium"
              tabIndex={isSubmitting ? -1 : 0}
            >
              Chính sách bảo mật
            </a>{" "}
            của TicketGo
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
