import { useEffect, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Event } from "@/constants/types/types";
import { Calendar, MapPin } from "lucide-react";
import { formatCurrency, formatDateTimeDisplay } from "@/utils/utils";
import CountdownTimer from "../components/Layouts/Client/CountdownTimer";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import axios from "@/utils/axiosInterceptor";
import ConfirmationDialog from "./ConfirmationDialog";
import CartItem from "@/components/Layouts/Client/CartItem";

type BookingFields = "receiverName" | "receiverPhone" | "receiverEmail";

interface BookingFormData {
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
}

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event>();
  const [loading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    receiverName?: string;
    receiverEmail?: string;
    receiverPhone?: string;
  }>({});
  const token = localStorage.getItem("token");
  // const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
  });

  const [cartDetails, setCartDetails] = useState<any[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [paymentExpiresAt, setPaymentExpiresAt] = useState<number | undefined>(
    undefined
  );

  const location = useLocation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [countdownKey, setCountdownKey] = useState(Date.now());

  // const state =
  //   (location.state as {
  //     receiverName?: string;
  //     receiverPhone?: string | null;
  //     receiverEmail?: string | null;
  //     paymentExpiresAt?: number;
  //   }) || {};

  // const receiverName = state.receiverName ?? "";
  // const receiverPhone = state.receiverPhone ?? null;
  // const receiverEmail = state.receiverEmail ?? null;
  // const paymentExpiresAt = state.paymentExpiresAt;

  let initialMinutes = paymentExpiresAt
    ? Math.max(0, (paymentExpiresAt - Date.now()) / (1000 * 60))
    : 15;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as BookingFields;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    try {
      const payload = {
        cartId: cartId,
        currentCartDetails: cartDetails.map((d) => ({
          id: d.id,
          quantity: d.quantity,
        })),
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        receiverEmail: formData.receiverEmail,
      };

      const res = await axios.post("/api/carts/prepare-checkout", payload);
      if (res.data.success) {
        navigate(`/events/${id}/bookings/select-ticket/booking-form/payment`, {
          state: {
            receiverName: payload.receiverName,
            receiverPhone: payload.receiverPhone,
            receiverEmail: payload.receiverEmail,
            paymentExpiresAt: paymentExpiresAt,
          },
        });

        toast.success("Thành công! Mời bạn tiến hành thanh toán");
      }
    } catch (err: any) {
      console.log(err);
      if (err.response?.data?.errors) {
        type BackendError = { path?: string; message?: string };
        const backendErrors: {
          receiverName?: string;
          receiverEmail?: string;
          receiverPhone?: string;
        } = {};
        (err.response.data.errors as BackendError[]).forEach((error) => {
          if (error.path === "receiverName")
            backendErrors.receiverName = error.message;
          else if (error.path === "receiverEmail")
            backendErrors.receiverEmail = error.message;
          else if (error.path === "receiverPhone")
            backendErrors.receiverPhone = error.message;
        });
        setErrors(backendErrors);
      } else {
        alert("Lỗi: " + (err.response?.data?.message || err.message));
      }
    }
  };

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

        const response = await axios.get(`/api/carts`);

        const result = response.data;

        if (result.cartDetails && Array.isArray(result.cartDetails)) {
          setCartDetails(result.cartDetails);
          const currentCartId =
            result.cartId ||
            (result.cartDetails.length > 0
              ? result.cartDetails[0].cartId
              : null);
          setCartId(currentCartId);
          localStorage.setItem("cartId", String(currentCartId));

          if (currentCartId) {
            const storageKey = `checkoutEnd_${currentCartId}`;
            let expiresAt: number;
            let receiverName: string | undefined;
            let receiverPhone: string | undefined;
            let receiverEmail: string | undefined;

            // Ưu tiên state từ trang Event Details, sau đó là Payment, sau đó là localStorage, cuối cùng mới tạo mới
            if (location.state?.countdownEndTime) {
              expiresAt = location.state.countdownEndTime;
            } else if (location.state?.paymentExpiresAt) {
              expiresAt = location.state.paymentExpiresAt;
              receiverName = location.state.receiverName;
              receiverPhone = location.state.receiverPhone;
              receiverEmail = location.state.receiverEmail;
              setFormData({
                receiverName: receiverName || "",
                receiverPhone: receiverPhone || "",
                receiverEmail: receiverEmail || "",
              });
            } else {
              const storedExpiresAt = localStorage.getItem(storageKey);
              if (storedExpiresAt) {
                expiresAt = Number(storedExpiresAt);
              } else {
                expiresAt = Date.now() + 15 * 60 * 1000;
                localStorage.setItem(storageKey, String(expiresAt));
              }
            }
            setPaymentExpiresAt(expiresAt);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchCartData();
    }
  }, [token, location.state]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue =
        "Bạn có chắc muốn rời khỏi trang? Các thay đổi sẽ không được lưu.";
    };

    const handlePopState = (event: PopStateEvent) => {
      if (!isNavigatingAway) {
        event.preventDefault();
        setShowConfirmDialog(true);
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isNavigatingAway]);

  useEffect(() => {
    const handler = () => {
      if (!document.hidden && paymentExpiresAt) {
        initialMinutes = Math.max(0, (paymentExpiresAt - Date.now()) / (1000 * 60));
        setCountdownKey(Date.now()); // Force re-render CountdownTimer
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [paymentExpiresAt]);


  if (loading) {
    return (
      <div className="flex flex-1 min-h-screen bg-black text-white text-xl items-center justify-center">
        Đang tải...
      </div>
    );
  }

  // Hiển thị PaymentForm khi showPayment = true
  // if (showPayment) {
  //   return <PaymentForm visible={true} />;
  // }

  const handleTimeout = async () => {
    try {
      await axios.delete("/api/carts");
      const cartId = localStorage.getItem("cartId");
      if (cartId) {
        localStorage.removeItem(`checkoutEnd_${cartId}`);
        localStorage.removeItem("cartId");
      }
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

  return (
    <>
      {/* HEADER */}
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
              onTimeout={() => {
                handleTimeout();
                setShowTimeoutDialog(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="bg-black w-full flex flex-1 pb-10">
        <div className="flex flex-1 gap-5 mx-10 lg:mx-auto max-w-[1200px]">
          {/* FORM */}
          <div className="flex-7">
            <h1 className="text-2xl font-bold my-10 text-[#2dc275]">
              BẢNG CÂU HỎI
            </h1>

            <div className="bg-[#38383d] px-4 py-10 rounded-xl shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* NAME */}
                <div className="flex flex-col gap-3">
                  <Label className="text-white">Họ và tên</Label>
                  <Input
                    name="receiverName"
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={formData.receiverName}
                    onChange={handleChange}
                    className="bg-[#2c2c30] border-gray-600 text-white py-6"
                  // {...register("receiverName")}
                  />
                  {errors.receiverName && (
                    <p className="text-red-500 text-sm">
                      {errors.receiverName}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="flex flex-col gap-3">
                  <Label className="text-white">Email</Label>
                  <Input
                    name="receiverEmail"
                    type="email"
                    placeholder="Nhập email"
                    value={formData.receiverEmail}
                    onChange={handleChange}
                    className="bg-[#2c2c30] border-gray-600 text-white py-6"
                  // {...register("receiverEmail")}
                  />
                  {errors.receiverEmail && (
                    <p className="text-red-500 text-sm">
                      {errors.receiverEmail}
                    </p>
                  )}
                </div>

                {/* PHONE NUM */}
                <div className="flex flex-col gap-3">
                  <Label className="text-white">Số điện thoại</Label>
                  <Input
                    name="receiverPhone"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={formData.receiverPhone}
                    onChange={handleChange}
                    className="bg-[#2c2c30] border-gray-600 text-white py-6"
                  // {...register("receiverPhone")}
                  />
                  {errors.receiverPhone && (
                    <p className="text-red-500 text-sm">
                      {errors.receiverPhone}
                    </p>
                  )}
                </div>
              </form>
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
              onClick={handleSubmit}
              className="w-full bg-[#2dc275] hover:bg-black hover:text-white text-white py-6 rounded-lg text-lg"
            >
              Tiếp tục
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
        onClose={() => { }}
        onConfirm={() => navigate(`/events/${id}/bookings/select-ticket`)}
        type="timeout"
      />
    </>
  );
};

export default BookingForm;
