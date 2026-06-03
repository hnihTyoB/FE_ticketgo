import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, X, Calendar } from "lucide-react";
// @ts-expect-error - JSX file without type declarations
import { useAuth } from "../contexts/AuthContext";
import UserSidebar from "../components/Layouts/Client/UserSidebar";
import axios from "@/utils/axiosInterceptor";
import { toast } from "sonner";

const AccountSettings = () => {
  const navigate = useNavigate();

  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",
    roleId: "",
    avatar: null,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.id) return;
      try {
        const res = await axios.get(`/api/users/${user.id}`);
        const userData = res.data;
        let birthDate = "";
        if (userData.birthDate) {
          if (typeof userData.birthDate === "string") {
            birthDate = userData.birthDate.split("T")[0];
          } else {
            birthDate = userData.birthDate.toISOString().split("T")[0];
          }
        }
        setFormData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          gender: userData.gender || "",
          birthDate: birthDate,
          roleId: userData.roleId || "",
          avatar: null,
        });
        if (userData.avatar) {
          let avatarPath;
          if (userData.avatar.includes("/") || userData.avatar.includes("\\")) {
            avatarPath = userData.avatar;
          } else {
            avatarPath = `/images/user/${userData.avatar}`;
          }

          console.log("Setting avatar path:", avatarPath);
          setAvatarPreview(avatarPath);
        } else {
          setAvatarPreview(
            `https://ui-avatars.com/api/?name=${userData.fullName || userData.email
            }&background=0D8ABC&color=fff&size=200`
          );
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));
    if (errors.gender) {
      setErrors((prev) => ({ ...prev, gender: "" }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      if (formData.phone) {
        formDataToSend.append("phone", formData.phone);
      }

      if (formData.birthDate && formData.birthDate.trim()) {
        formDataToSend.append("birthDate", formData.birthDate);
      }
      if (formData.gender) {
        formDataToSend.append("gender", formData.gender);
      }
      if (formData.roleId) {
        formDataToSend.append("roleId", formData.roleId);
      }
      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      const response = await axios.put(
        `/api/users/${user.id}`,
        formDataToSend
      );

      if (response.data.user) {
        login(response.data.user, response.data.token);
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error.response.data.errors.forEach((err: any) => {
          if (err.path === "fullName") backendErrors.fullName = err.message;
          else if (err.path === "phone") backendErrors.phone = err.message;
          else if (err.path === "birthDate")
            backendErrors.birthDate = err.message;
          else if (err.path === "gender") backendErrors.gender = err.message;
          else if (err.path === "roleId") backendErrors.roleId = err.message;
        });
        setErrors(backendErrors);
      } else {
        toast.error("Lỗi: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-white">
          Vui lòng đăng nhập để xem thông tin tài khoản
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]">
      <div className="mx-4 md:mx-30 py-4 md:py-8">
        {/* Breadcrumb */}
        <div className="text-xs md:text-sm text-gray-400 mb-4 md:mb-8">
          <button
            onClick={() => navigate("/")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Trang chủ
          </button>
          <span className="mx-1 md:mx-2">›</span>
          <span className="text-white">Vé của tôi</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <UserSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-6 lg:mb-8">
              Thông tin tài khoản
            </h1>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              {/* Avatar Section - Compact */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#2dc275]"
                  />
                  <label className="absolute bottom-0 right-0 bg-[#2dc275] rounded-full p-1.5 cursor-pointer hover:bg-[#25a563]">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Cung cấp thông tin chính xác sẽ hỗ trợ bạn trong
                  <br />
                  quá trình mua vé, hoặc khi cần thực hiện vé
                </p>
              </div>

              {/* Form Fields - Compact */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Họ và tên
                    {errors.fullName && (
                      <span className="text-red-400 text-xs ml-2">
                        * {errors.fullName}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 bg-white text-black rounded text-sm ${errors.fullName ? "border-2 border-red-500" : ""
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Số điện thoại
                    {errors.phone && (
                      <span className="text-red-400 text-xs ml-2">
                        * {errors.phone}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2.5 bg-white text-black rounded text-sm pr-10 ${errors.phone ? "border-2 border-red-500" : ""
                        }`}
                      placeholder="Nhập số điện thoại"
                    />
                    {formData.phone && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, phone: "" }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2.5 bg-gray-700 text-gray-300 rounded cursor-not-allowed text-sm pr-10"
                    />
                    {user.accountType === "GOOGLE" && (
                      <Check
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Ngày tháng năm sinh
                    {errors.birthDate && (
                      <span className="text-red-400 text-xs ml-2">
                        * {errors.birthDate}
                      </span>
                    )}
                  </label>
                  <div className="relative group">
                    <input
                      ref={dateInputRef}
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2.5 pr-10 bg-white text-black rounded text-sm cursor-pointer transition-all duration-200 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden ${errors.birthDate
                        ? "border-2 border-red-500"
                        : "border border-gray-300 hover:border-[#2dc275] focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => dateInputRef.current?.showPicker()}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                      aria-label="Chọn ngày"
                    >
                      <Calendar
                        className="w-5 h-5 text-gray-400 group-hover:text-[#2dc275] transition-colors duration-200"
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Giới tính
                    {errors.gender && (
                      <span className="text-red-400 text-xs ml-2">
                        * {errors.gender}
                      </span>
                    )}
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Nam"
                        checked={formData.gender === "Nam"}
                        onChange={() => handleGenderChange("Nam")}
                        className="w-4 h-4 accent-[#2dc275]"
                      />
                      <span className="text-white text-sm">Nam</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Nữ"
                        checked={formData.gender === "Nữ"}
                        onChange={() => handleGenderChange("Nữ")}
                        className="w-4 h-4 accent-[#2dc275]"
                      />
                      <span className="text-white text-sm">Nữ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Khác"
                        checked={formData.gender === "Khác"}
                        onChange={() => handleGenderChange("Khác")}
                        className="w-4 h-4 accent-[#2dc275]"
                      />
                      <span className="text-white text-sm">Khác</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-[#2dc275] hover:bg-[#25a563] text-white py-2.5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Hoàn thành"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
