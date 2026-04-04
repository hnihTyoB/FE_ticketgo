import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/utils/axiosInterceptor";
import { jwtDecode } from "jwt-decode";
import { Calendar, MapPin } from "lucide-react";
import { formatCurrency, formatDateTimeDisplay } from "@/utils/utils";
import CountdownTimer from "@/components/Layouts/Client/CountdownTimer";
import type { Event, MyJwtPayload } from "@/constants/types/types";
import CartItem from "@/components/Layouts/Client/CartItem";
import ConfirmationDialog from "./ConfirmationDialog";
import PaymentMethods from "@/components/Layouts/Client/PaymentMethods";

const PaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [event, setEvent] = useState<Event>();
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");
  const [cartDetails, setCartDetails] = useState<any[]>([]);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [countdownKey, setCountdownKey] = useState(Date.now());

  const location = useLocation();
  const state =
    (location.state as {
      receiverName?: string;
      receiverPhone?: string | null;
      receiverEmail?: string | null;
      paymentExpiresAt?: number;
    }) || {};

  const receiverName = state.receiverName ?? "";
  const receiverPhone = state.receiverPhone ?? null;
  const receiverEmail = state.receiverEmail ?? null;
  const paymentExpiresAt = state.paymentExpiresAt;

  let initialMinutes = paymentExpiresAt
    ? Math.max(0, (paymentExpiresAt - Date.now()) / (1000 * 60))
    : 15;

  const handleTimeout = async () => {
    try {
      await axios.delete("/api/carts");
      const cartId = localStorage.getItem("cartId");
      if (cartId) {
        localStorage.removeItem(`checkoutEnd_${cartId}`);
        localStorage.removeItem("cartId");
      }
      setShowTimeoutDialog(false);
      navigate(`/events/${id}/bookings/select-ticket`);
    } catch (error) {
      toast.error("Lỗi khi hủy đơn hàng.");
    }
  };

  const handleCancel = async () => {
    try {
      await axios.delete("/api/carts");
      const cartId = localStorage.getItem("cartId");
      if (cartId) {
        localStorage.removeItem(`checkoutEnd_${cartId}`);
        localStorage.removeItem("cartId");
      }
      setIsNavigatingAway(true);
      setShowConfirmDialog(false);
      navigate(`/events/${id}/bookings/select-ticket`);
    } catch (error) {
      toast.error("Lỗi khi hủy đơn hàng.");
    }
  };

  const handleBack = () => {
    setIsNavigatingAway(true);
    navigate(`/events/${id}/bookings/select-ticket/booking-form`, {
      state: {
        receiverName,
        receiverPhone,
        receiverEmail,
        paymentExpiresAt,
      },
    });
  };

  const decodedUser = token ? jwtDecode<MyJwtPayload>(token) : null;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(`/api/events/${String(id)}`);

        const result = response.data;
        setEvent(result);
      } catch (err: any) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    window.scrollTo(0, 0);

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(`/api/carts/checkout`);

        const result = response.data;
        // Store cart details and ID for checkout payload
        if (result.cartDetails && Array.isArray(result.cartDetails)) {
          setCartDetails(result.cartDetails);
        }
        // console.log("FETCH CART DATA", result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchCartData();
    }
  }, [token]);

  const handleSelect = (value: string) => {
    setPaymentMethod(value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // const totalPrice = cartDetails.reduce(
      //   (sum, item) => sum + (item.price * item.quantity),
      //   0
      // );

      const payload = {
        userId: decodedUser?.id,
        receiverName,
        receiverPhone,
        receiverEmail,
        // totalPrice: totalPrice,
        paymentMethod,
      };

      const response = await axios.post("/api/carts/place-order", payload);

      if (response.data.paymentUrl) {
        setIsNavigatingAway(true);
        window.location.href = response.data.paymentUrl;
      } else {
        toast.success(response.data.message || "Đặt hàng thành công!");
      }
    } catch (error) {
      console.error(
        "Place order error:",
        (error as any).response?.data?.message
      );
      // toast.error(
      //   (error as any).response?.data?.message || "Lỗi khi đặt hàng"
      // );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!isNavigatingAway) {
        event.preventDefault();
        handleBack();
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isNavigatingAway]);

  useEffect(() => {
    const handler = () => {
      if (!document.hidden && paymentExpiresAt) {
        initialMinutes = Math.max(
          0,
          (paymentExpiresAt - Date.now()) / (1000 * 60)
        );
        setCountdownKey(Date.now()); // Force re-render CountdownTimer
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [paymentExpiresAt]);

  return (
    <>
      <div className="relative w-full h-62 md:h-72 lg:h-62 overflow-hidden">
        <img
          src={event?.bannerUrl?.startsWith('http') ? event.bannerUrl : `/images/event/${event?.bannerUrl}`}
          alt={`${event?.title} banner`}
          className="absolute inset-0 w-full h-full object-cover blur-lg"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="flex flex-row items-center justify-between relative mx-10 lg:mx-auto max-w-[1250px] gap-6 md:gap-8  text-white h-full ">
          {/* INFO SECTION */}
          <div className="flex flex-col flex-9 gap-2">
            <h1 className="flex-1 w-full lg:text-3xl sm:text-xl md:text-2xl font-bold mb-2 py-5 border-b-white border-b-1 ">
              {event?.title.toUpperCase()}
            </h1>
            <div className="flex items-center mb-2 gap-2 text-white">
              <Calendar strokeWidth={3} size={24} className="text-white" />
              <p className="font-bold text-xl sm:text-sm lg:text-lg">
                {event?.duration},{" "}
                {event
                  ? formatDateTimeDisplay(event.startDate)
                  : "Chưa có ngày diễn ra"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-white">
              <MapPin strokeWidth={3} size={24} className="text-white" />
              <p className="font-bold text-xl sm:text-sm lg:text-lg">
                {event?.location}
              </p>
            </div>
          </div>
          {/* COUNTDOWN SECTION */}
          <div className="flex-1">
            <CountdownTimer
              key={countdownKey}
              initialMinutes={initialMinutes}
              onTimeout={() => setShowTimeoutDialog(true)}
            />
          </div>
        </div>
      </div>

      <div className="bg-black w-full flex flex-1 pb-10">
        <div className="flex flex-1 gap-5 mx-10 lg:mx-auto max-w-[1200px]">
          {/* FORM */}
          <div className="flex-7">
            <h1 className="text-2xl font-bold my-10 text-[#2dc275]">
              THANH TOÁN
            </h1>

            <div className="flex flex-col gap-10 text-white">
              <div className="bg-[#38383d] p-4 rounded-2xl">
                <h3 className="text-[#2dc275] text-lg font-semibold ">
                  Thông tin nhận vé
                </h3>

                <p className="text-sm line-clamp-2 mt-4">
                  Vé điện tử sẽ được hiển thị trong mục <b>"Vé của tôi"</b> của
                  tài khoản <b>"{decodedUser?.email || ""}"</b>
                </p>
                <div className="space-y-6"></div>
              </div>

              {/* <div className="bg-[#38383d] p-4 rounded-2xl">
              <h3 className="text-[#2dc275] text-lg font-semibold ">
                Mã khuyến mãi
              </h3>
              <div className="space-y-6">
                
              </div>
            </div> */}

              <div className="bg-[#38383d] p-4 rounded-2xl">
                <h3 className="text-[#2dc275] text-lg font-semibold ">
                  Phương thức thanh toán
                </h3>
                <PaymentMethods
                  onSelect={handleSelect}
                  selected={paymentMethod}
                />
              </div>
            </div>
          </div>

          {/* ORDER INFO  */}
          <div className="flex flex-col gap-4 bg-white text-black flex-3 mt-28 rounded-xl p-4 h-fit">
            <div className="flex justify-between">
              <h3 className="font-semibold text-lg">Thông tin đặt vé</h3>
              <a
                onClick={() => setShowConfirmDialog(true)}
                className="font-semibold text-md text-[#2dc275] hover:text-black transition-colors duration-500 cursor-pointer"
              >
                Chọn lại vé
              </a>
            </div>

            <div className="flex flex-col gap-3   border-b-1 border-dashed border-b-gray-600 pb-4">
              {/* TITLE */}
              <div className="flex justify-between">
                <p className="font-semibold text-md">Loại vé</p>
                <p className="font-semibold text-md">Số lượng</p>
              </div>

              {/* INFO  */}
              <div className="flex flex-col gap-2">
                {cartDetails && cartDetails.length > 0 ? (
                  cartDetails.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))
                ) : (
                  <div className="flex">Giỏ hàng trống</div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <p className="font-semibold text-md">
                Tạm tính{" "}
                {cartDetails.length > 0
                  ? cartDetails.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )
                  : 0}{" "}
                ghế
              </p>
              <p className="font-bold text-lg text-[#2dc275]">
                {cartDetails.length > 0
                  ? formatCurrency(
                    cartDetails.reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    )
                  )
                  : formatCurrency(0)}
              </p>
            </div>

            <p className="text-sm text-center text-black/30 font-semibold">
              Vui lòng trả lời tất cả các câu hỏi để tiếp tục
            </p>

            <Button
              type="button"
              disabled={isLoading}
              className="w-full bg-[#2dc275] hover:bg-black hover:text-white text-white py-6 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
            >
              {isLoading ? "Đang xử lý..." : "Tiếp tục"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancel}
        onConfirm={() => setShowConfirmDialog(false)}
        type="leaveBooking"
        confirmText="Ở lại"
        cancelText="Hủy đơn"
      />

      <ConfirmationDialog
        isOpen={showTimeoutDialog}
        onClose={() => { }} // Không cho phép đóng
        onConfirm={handleTimeout}
        type="timeout"
      />
    </>
  );
};

export default PaymentForm;
