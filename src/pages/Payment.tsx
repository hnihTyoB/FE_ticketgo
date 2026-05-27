import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/utils/axiosInterceptor";
import { paymentMethods } from "@/constants/data/paymentMethods";

interface TicketSelection {
  type: string;
  price: number;
  quantity: number;
  ticketTypeId: number;
}

interface PaymentState {
  eventId: string;
  eventName: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  selectedTickets: TicketSelection[];
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.value || "");

  const paymentData = location.state as PaymentState;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = (): boolean => {
    if (!receiverName.trim()) {
      toast.error("Vui lòng nhập tên người nhận");
      return false;
    }
    if (!receiverPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(receiverPhone.trim())) {
      toast.error("Số điện thoại không hợp lệ");
      return false;
    }
    return true;
  };

  const handleCreateOrder = async () => {
    if (!paymentData) return;

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      for (const ticket of paymentData.selectedTickets) {
        await axios.post(`/api/carts`, {
          ticketTypeId: ticket.ticketTypeId,
          quantity: ticket.quantity,
        });
      }

      const orderResponse = await axios.post(`/api/carts/place-order`, {
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        receiverEmail: receiverEmail.trim() || null,
        totalPrice: paymentData.totalAmount,
        paymentMethod: paymentMethod,
      });

      const data = orderResponse.data;

      if (!data.success) {
        throw new Error(data.message || "Không thể tạo đơn hàng");
      }

      if (data.paymentUrl) {
        sessionStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            orderId: data.orderId,
            amount: paymentData.totalAmount,
            eventName: paymentData.eventName,
          })
        );

        window.location.href = data.paymentUrl;
      } else {
        toast.success("Đặt vé thành công!");
        navigate("/my-tickets");
      }
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo đơn hàng"
      );
      setIsProcessing(false);
    }
  };

  if (!paymentData) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Không có thông tin thanh toán
          </h1>
          <p className="text-gray-400 mb-8">
            Vui lòng chọn vé từ trang sự kiện để tiếp tục thanh toán.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/all-events")}
              className="px-6 py-3 bg-[#2dc275] text-white rounded-lg font-semibold hover:bg-[#25a562] transition-colors"
            >
              Xem sự kiện
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center text-[#2dc275] font-bold text-xl mb-8">
          <button
            className="flex items-center gap-3"
            onClick={() => navigate(-1)}
          >
            <svg
              width="20"
              height="21"
              viewBox="0 0 20 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.707 3.793a1 1 0 010 1.414L4.414 9.5H18a1 1 0 110 2H4.414l4.293 4.293a1 1 0 11-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0z"
                fill="#fff"
              ></path>
            </svg>
            Trở về
          </button>
          <p className="mx-auto">Thanh toán</p>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-white text-2xl font-bold mb-4">
            Thông tin đơn hàng
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span className="text-gray-400">Sự kiện:</span>
              <span className="font-semibold">{paymentData.eventName}</span>
            </div>
            <div className="flex justify-between text-white">
              <span className="text-gray-400">Loại vé:</span>
              <span className="font-semibold">{paymentData.ticketType}</span>
            </div>
            <div className="flex justify-between text-white">
              <span className="text-gray-400">Số lượng:</span>
              <span className="font-semibold">{paymentData.quantity}</span>
            </div>
            <div className="border-t border-gray-700 pt-3 mt-3">
              <div className="flex justify-between text-white text-xl">
                <span className="font-bold">Tổng cộng:</span>
                <span className="font-bold text-[#2dc275]">
                  {paymentData.totalAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Receiver Information */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-4">
            Thông tin người nhận
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Họ và tên *</label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#2dc275] focus:outline-none"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Số điện thoại *</label>
              <input
                type="tel"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#2dc275] focus:outline-none"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-[#2dc275] focus:outline-none"
                placeholder="Nhập email (không bắt buộc)"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-4">
            Phương thức thanh toán
          </h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === method.value
                  ? "border-[#2dc275] bg-[#2dc275]/10"
                  : "border-gray-700 bg-gray-800/50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {method.icon && (
                    <img src={method.icon} alt={method.label} className="w-8 h-8 object-contain" />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-semibold">{method.label}</p>
                    <p className="text-gray-400 text-sm">
                      Thanh toán nhanh bằng ví/cổng {method.label}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.value
                      ? "border-[#2dc275]"
                      : "border-gray-600"
                      }`}
                  >
                    {paymentMethod === method.value && (
                      <div className="w-3 h-3 rounded-full bg-[#2dc275]"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Button */}
        <button
          onClick={handleCreateOrder}
          disabled={isProcessing}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${isProcessing
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-[#2dc275] text-white hover:bg-[#25a562]"
            }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            `Xác nhận đặt vé (Thanh toán qua ${paymentMethods.find(m => m.value === paymentMethod)?.label || "cổng thanh toán"})`
          )}
        </button>
      </div>
    </div>
  );
};

export default Payment;
