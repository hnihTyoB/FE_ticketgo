import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, AlertCircle } from "lucide-react";
import axios from "@/utils/axiosInterceptor";
// @ts-expect-error - JSX file without type declarations
import { useAuth } from "@/contexts/AuthContext";

interface OrderDetail {
  id: number;
  quantity: number;
  price: number;
  ticketType: {
    type: string;
    event: {
      title: string;
    };
  };
}

interface OrderData {
  id: number;
  totalPrice: number;
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentRef?: string;
  createdAt: string;
  ticketOrderDetails: OrderDetail[];
}

const CancelledPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshPendingOrdersCount } = useAuth();

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng");
      setLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      try {
        const response = await axios.get(`/api/orders/${orderId}`);
        console.log("Order response:", response.data);

        if (response.data.success && response.data.orderDetails) {
          setOrderData(response.data.orderDetails);
          refreshPendingOrdersCount();
        } else {
          throw new Error(response.data.message || "Lỗi khi lấy thông tin đơn hàng");
        }
      } catch (err: any) {
        console.error("Fetch order error:", err);
        if (err.response?.status === 401) {
          setError("Vui lòng đăng nhập để xem thông tin đơn hàng");
        } else if (err.response?.status === 403) {
          setError("Bạn không có quyền xem đơn hàng này");
        } else {
          setError(
            err instanceof Error ? err.message : "Lỗi khi lấy thông tin đơn hàng"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN");
  };

  const getPaymentMethodDisplay = (method: string) => {
    const map: Record<string, string> = {
      ZALOPAY: "ZaloPay",
      MOMO: "Ví Momo",
      SHOPEEPAY: "ShopeePay",
      CARD: "Thẻ Quốc tế (Visa/Mastercard)",
      VIETQR: "Chuyển khoản VietQR",
    };
    return map[method.toUpperCase()] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] flex items-center justify-center p-4">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-red-500 mx-auto mb-4"
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
          <p className="text-white text-lg">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1e2533] rounded-2xl p-8 md:p-12 shadow-2xl border border-[#2a3142]">
            <div className="flex justify-center mb-8">
              <div className="bg-red-500/20 rounded-full p-4 shadow-lg">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-3">
                Lỗi
              </h1>
              <p className="text-gray-400 text-base md:text-lg">
                {error || "Không thể tải thông tin đơn hàng"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/my-tickets")}
                className="flex-1 bg-[#2dc275] hover:bg-[#25a860] text-white font-semibold py-6 rounded-lg text-base transition-colors"
              >
                Xem vé của tôi
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-[#38383d] hover:bg-[#45454a] text-white font-semibold py-6 rounded-lg text-base transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-[#1a2332] rounded-2xl p-8 md:p-10 shadow-2xl border border-[#3f2a2a]">
          {/* Cancelled Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-500 rounded-full p-2 shadow-lg">
              <XCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Cancelled Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-2">
              Đã hủy thanh toán
            </h1>
            <p className="text-gray-400 text-base">
              Giao dịch của bạn đã bị hủy.
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-[#0f1419] rounded-xl p-6 mb-6 border border-[#3f2a2a]">
            <h2 className="text-white text-lg font-bold mb-6">Chi tiết đơn hàng</h2>

            <div className="space-y-5">
              {/* Transaction ID */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-base">Mã đơn hàng:</span>
                <span className="text-white font-mono text-xl font-bold">
                  ORD{orderData.id}
                </span>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-base">Số tiền:</span>
                <span className="text-red-500 font-bold text-2xl">
                  {formatCurrency(orderData.totalPrice)} đ
                </span>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-base">Trạng thái:</span>
                <span className="text-red-500 font-semibold text-lg">
                  {orderData.status === "CANCELLED" ? "Đã hủy" : "Chưa thanh toán"}
                </span>
              </div>

              {/* Payment Method */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-base">Phương thức:</span>
                <span className="text-white font-semibold text-lg">
                  {orderData.paymentMethod ? getPaymentMethodDisplay(orderData.paymentMethod) : "N/A"}
                </span>
              </div>

              {/* Time */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-base">Thời gian:</span>
                <span className="text-white font-mono text-lg">
                  {formatDate(orderData.createdAt)}
                </span>
              </div>

              {/* Description */}
              <div className="flex justify-between items-start pt-6 border-t border-[#3f2a2a]">
                <span className="text-gray-400 text-base">Nội dung:</span>
                <div className="text-right">
                  <p className="text-white font-semibold text-base">
                    {orderData.ticketOrderDetails && orderData.ticketOrderDetails.length > 0
                      ? orderData.ticketOrderDetails
                        .map((d) => `${d.ticketType.event.title} - ${d.ticketType.type} x${d.quantity}`)
                        .join(", ")
                      : "Thanh toán vé"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Receiver Info */}
          <div className="bg-[#0f1419] rounded-xl p-6 mb-6 border border-[#3f2a2a]">
            <h2 className="text-white text-lg font-bold mb-4">Thông tin người nhận</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tên:</span>
                <span className="text-white font-semibold">{orderData.receiverName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Số điện thoại:</span>
                <span className="text-white font-mono">{orderData.receiverPhone}</span>
              </div>
              {orderData.receiverEmail && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-mono text-xs">{orderData.receiverEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/my-tickets")}
              className="flex-1 bg-[#2dc275] hover:bg-[#25a860] text-white font-bold py-3 rounded-lg text-base transition-colors"
            >
              Xem vé của tôi
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-[#38454d] hover:bg-[#45525a] text-white font-bold py-3 rounded-lg text-base transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelledPage;
