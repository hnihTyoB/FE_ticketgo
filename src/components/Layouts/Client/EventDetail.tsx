import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { formatCurrency, formatDateTimeDisplay } from "../../../utils/utils";
import PrimaryColorButton from "./PrimaryColorButton";
import type { Event } from "../../../constants/types/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
// @ts-expect-error - JSX file without type declarations
import { useAuth } from "../../../contexts/AuthContext";
import axios, { openAuthModal } from "../../../utils/axiosInterceptor";
import CategoryFilterBar from "./CategoryFilterBar";
import { categories } from "@/constants/data/categories";
import { getDisplayPrice } from "@/utils/getDisplayPrice";
import ConfirmationDialog from "@/pages/ConfirmationDialog";
import { toast } from "sonner";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event>();
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [cartDetailsForDialog, setCartDetailsForDialog] = useState<any[]>([]);
  const [countdownEndTime, setCountdownEndTime] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(`/api/events/${String(id)}`);
        const result = await response.data;
        setEvent(result);
      } catch (err: any) {
        setError(err.message);
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchEvents();
  }, [id]);

  const minPrice = getDisplayPrice(event?.ticketTypes ?? []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-2xl font-bold text-center text-white">
        Đang tải...
      </div>
    );
  }

  const handleCancel = async () => {
    try {
      await axios.delete("/api/carts");
      const cartId = localStorage.getItem("cartId");
      if (cartId) {
        localStorage.removeItem(`checkoutEnd_${cartId}`);
        localStorage.removeItem("cartId");
      }
      setShowConfirmDialog(false);
      navigate(`/events/${id}/bookings/select-ticket`);
    } catch (error) {
      toast.error("Lỗi khi hủy đơn hàng.");
    }
  }

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    navigate(`/events/${id}/bookings/select-ticket/booking-form`, {
      state: { countdownEndTime },
    });
  }

  const handleDialogTimeout = () => {
    handleTimeout();
    setShowConfirmDialog(false);
    setShowTimeoutDialog(true);
  };

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

  const handleSelectTicket = async (eventId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const response = await axios.get(`/api/carts`);
      const result = response.data;

      const cartId = result.cartId;
      const cartDetails = result.cartDetails;

      if (cartId && cartDetails && cartDetails.length > 0) {
        const storageKey = `checkoutEnd_${cartId}`;
        const expiresAt = localStorage.getItem(storageKey);

        if (expiresAt && Number(expiresAt) > Date.now()) {
          setCartDetailsForDialog(cartDetails);
          setCountdownEndTime(Number(expiresAt));
          setShowConfirmDialog(true);
          return;
        }
      }
      navigate(`/events/${eventId}/bookings/select-ticket`);
    } catch (error) {
      console.error(error);
    }
  };

  if (!event)
    return (
      <div className="flex flex-1 min-h-screen items-center justify-center bg-[#27272A]">
        <p className="text-3xl font-bold text-white">
          Sự kiện không tồn tại. Mời bạn chọn sự kiện khác
        </p>
      </div>
    );

  const totalTickets = event.ticketTypes.reduce(
    (sum, ticket) => sum + ticket.quantity,
    0
  );
  const isSoldOut = totalTickets === 0;
  const isTimeExpired = new Date(event.startDate) <= new Date();

  return (
    <>
      <CategoryFilterBar data={categories} />
      {/* TICKET INFO SECTION */}
      <div className="w-full py-8 bg-gradient-to-b from-[#27272A] from-60% to-black text-white">
        <div className="relative mx-5 lg:mx-auto max-w-[1250px] flex flex-col md:flex-row rounded-4xl overflow-hidden shadow-lg">
          {/* Left side: Info */}
          {/* left upper */}
          <div className="md:w-[36%] p-3 sm:p-6 md:p-8 flex flex-col justify-between bg-[#38383d]">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
                {event.title}
              </h1>
              <div className="flex items-center mb-4 sm:mb-6 gap-2 text-[#2dc275]">
                <Calendar strokeWidth={3} size={20} className="text-white" />
                <p className="font-bold text-xs sm:text-sm">
                  {event.duration}, {formatDateTimeDisplay(event.startDate)}
                </p>
              </div>
              <div className="flex items-center mb-4 gap-2 text-[#2dc275]">
                <MapPin strokeWidth={3} size={20} className="text-white" />
                <p className="font-bold text-xs sm:text-sm">{event.location}</p>
              </div>
            </div>

            {/* left lower - price action section */}
            <div className="border-t border-gray-300 font-bold">
              <div className="py-4 text-lg lg:text-xl sm:text-xl text-gray-200 flex flex-row gap-1.5 items-center">
                Giá từ{" "}
                <span className="flex items-center gap-4 justify-center text-[#2dc275] text-xl sm:text-2xl lg:text-3xl">
                  {formatCurrency(minPrice)}
                  <svg
                    width="8"
                    height="14"
                    viewBox="0 0 8 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M.293.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L5.586 7 .293 1.707a1 1 0 010-1.414z"
                      fill="#2dc275"
                    ></path>
                  </svg>
                </span>
              </div>

              <PrimaryColorButton
                title={isSoldOut ? "Hết vé" : isTimeExpired ? "Sự kiện đã kết thúc" : "Mua vé ngay"}
                disabled={isSoldOut || isTimeExpired}
                fullSize={true}
                onClick={() => handleSelectTicket(String(event.id))}
              />
            </div>
          </div>

          {/* divider */}
          <div className="hidden md:flex flex-col absolute justify-center items-center top-0 bottom-0 left-[36%] -translate-x-1/2">
            <div className="w-18 h-10 rounded-b-full bg-[#27272A]"></div>
            <svg
              width="4"
              height="100%"
              viewBox="0 0 4 415"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              id="vertical-dashed"
            >
              <path
                stroke="#27272A"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="4 10"
                d="M2 2v411"
              ></path>
            </svg>
            <div className="w-18 h-10 rounded-t-full bg-black"></div>
          </div>

          {/* Right side: Banner */}
          <div className="md:w-[64%]">
            <img
              src={event?.bannerUrl?.startsWith('http') ? event.bannerUrl : `/images/event/${event?.bannerUrl}`}
              alt={event.title}
              className="w-full h-auto object-cover aspect-[16/9]"
            />
          </div>
        </div>
      </div>

      {/* TICKET DETAILS SECTION */}
      <div className="w-full py-8 bg-[#F5F7FC] text-white">
        <div className="mx-10 lg:mx-auto max-w-[1250px] flex gap-6 md:gap-8 flex-col">
          {/* details section */}
          <div className="p-3 sm:p-5 md:p-8 bg-white rounded-2xl">
            <h1 className="py-2 mb-6 text-black text-md font-bold border-b border-[#ebebf0]">
              Giới thiệu
            </h1>
            {/* description section */}
            <div
              className="mb-4 text-sm text-black"
              dangerouslySetInnerHTML={{ __html: event.description }}
            ></div>
          </div>

          {/* booking section */}
          <div className="bg-[#27272A] rounded-2xl py-4">
            <div className="mx-3 flex flex-col sm:flex-row items-start sm:items-center py-3 justify-between border-b border-black gap-3 sm:gap-0">
              <h1 className="text-white text-md font-bold">Thông tin vé</h1>
              <PrimaryColorButton
                title={isSoldOut ? "Hết vé" : isTimeExpired ? "Sự kiện đã kết thúc" : "Mua vé ngay"}
                disabled={isSoldOut || isTimeExpired}
                onClick={() => handleSelectTicket(String(event.id))}
              />
            </div>

            {/* ticket tyupe */}
            <div>
              <Accordion type="single" collapsible className="w-full">
                {event.ticketTypes.map((ticket, index) => (
                  <AccordionItem
                    key={ticket.id}
                    value={`ticket-${ticket.id}`}
                    className={`border-none ${index % 2 === 0 ? "bg-[#2f3033]" : "bg-[#38383d]"
                      }`}
                  >
                    <div className="flex justify-between items-center py-3 px-4">
                      {/* LEFT: ticket name + accordion trigger*/}
                      <AccordionTrigger className="py-0 text-left text-white font-semibold text-sm sm:text-base hover:no-underline">
                        {ticket.type}
                      </AccordionTrigger>

                      {/* RIGHT: ticket price and status */}
                      <div className="text-left sm:text-right">
                        <p
                          className={`font-bold py-2 ${ticket.quantity === 0
                            ? "text-gray-400"
                            : "text-[#2dc275]"
                            }`}
                        >
                          {ticket.price.toLocaleString("de-DE")} đ
                        </p>
                        {ticket.quantity === 0 && (
                          <div className="text-center bg-red-200 p-1 text-red-600 font-bold rounded-xl text-xs sm:text-sm">
                            Hết vé
                          </div>
                        )}
                      </div>
                    </div>

                    {/* accordion ticket description */}
                    <AccordionContent className="px-4 pb-4 text-gray-200 text-sm leading-relaxed">
                      {ticket.description ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: ticket.description,
                          }}
                        ></div>
                      ) : (
                        <p className="italic text-gray-400">
                          Chưa có thông tin về loại vé này.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        type="continueBooking"
        cartItems={cartDetailsForDialog}
        onTimeout={handleDialogTimeout}
        countdownEndTime={countdownEndTime}
        confirmText="Quay lại đơn cũ"
        cancelText="Hủy đơn, mua vé mới"
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

export default EventDetail;
