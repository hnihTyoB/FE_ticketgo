import { useState, useEffect, useRef } from "react";
import logo from "../../../../public/ticketgo_logo2.png";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "@/utils/axiosInterceptor";

export default function HeaderAdmin({ setOpen }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      logout();
      setIsUserMenuOpen(false);
      navigate("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#2dc275] text-white shadow-md">
      <div className="flex justify-between items-center">
        <Link to="/admin" className="flex items-center gap-3 py-3 px-4">
          <img
            src="/ticketgo_logo.png"
            alt="TicketGo"
            width="60"
            height="22"
            className="w-[60px] sm:w-[80px] md:w-[100px] md:h-[22px]"
          />
        </Link>

        <div className="flex items-center gap-4">
          <div
            className="relative flex items-center"
            ref={userMenuRef}
            onMouseEnter={() => setIsUserMenuOpen(true)}
            onMouseLeave={() => setIsUserMenuOpen(false)}
          >
            <button className="text-white hover:text-gray-200 py-3 px-4">
              <FontAwesomeIcon icon={faUser} className="h-6 w-6" />
            </button>

            <div
              className={`absolute right-1 top-12 w-8 h-2 ${isUserMenuOpen ? "block" : "hidden"
                }`}
            ></div>

            <div
              className={`absolute right-1 top-12 w-48 origin-top-right transform rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition duration-100 ease-out ${isUserMenuOpen
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0"
                }`}
            >
              {user && (
                <div className="py-1 text-gray-700">
                  <div className="px-4 py-3 flex items-center gap-3 border-b">
                    <img
                      src={
                        user.avatar
                          ? user.avatar.startsWith("http")
                            ? user.avatar
                            : `/images/user/${user.avatar}`
                          : `https://ui-avatars.com/api/?name=${user.fullName}&background=0D8ABC&color=fff`
                      }
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {user.fullName}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            aria-controls="default-sidebar"
            type="button"
            onClick={() => setOpen((open) => !open)}
            className="inline-flex items-center p-2 text-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:hidden"
          >
            <span className="sr-only">Toggle sidebar</span>
            <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
