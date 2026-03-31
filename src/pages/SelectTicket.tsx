import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { Event } from "../constants/types/types";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { formatDateTimeDisplay } from "../utils/utils";
import PrimaryColorButton from "../components/Layouts/Client/PrimaryColorButton";
import { toast } from "sonner";
import axios from "@/utils/axiosInterceptor";

const SelectTicket = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event>();
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [ticketCounts, setTicketCounts] = useState<{ [key: number]: number }>(
    {}
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(`/api/events/${String(id)}`);

        const result = response.data;
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
  }, []);

  // increase ticket
  const handleIncrement = (id: number) => {
    setTicketCounts((prev) => {
      const newCounts = {
        ...prev,
        [id]: (prev[id] || 0) + 1,
      };
      return newCounts;
    });
  };

  const handleToBookingForm = (eventId: string) => {
    navigate(`/events/${eventId}/bookings/select-ticket/booking-form`);
    toast.success("Bạn đã vào hàng đợi");
  };

  const handleAddToCart = async () => {
    const ticketsToAdd = Object.entries(ticketCounts)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({
        ticketTypeId: Number(ticketTypeId),
        quantity,
      }));

    if (ticketsToAdd.length === 0) {
      toast.error("Vui lòng chọn ít nhất một vé.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setIsLoading(true);
      const payload = {
        tickets: ticketsToAdd,
      };

      await axios.post(`/api/carts/add-multiple`, payload);

      handleToBookingForm(String(event?.id));
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi chọn vé");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // decrease
  const handleDecrement = (id: number) => {
    setTicketCounts((prev) => {
      const newCounts = {
        ...prev,
        [id]: Math.max((prev[id] || 0) - 1, 0),
      };
      return newCounts;
    });
  };

  // total money sum
  const totalPrice = useMemo(() => {
    if (!event) return 0;
    return event.ticketTypes.reduce((sum, t) => {
      const count = ticketCounts[t.id] || 0;
      return sum + count * t.price;
    }, 0);
  }, [event, ticketCounts]);

  // total selected
  const totalSelected = Object.values(ticketCounts || {}).reduce(
    (sum, count) => sum + Number(count || 0),
    0
  );

  // loading handler
  if (loading) {
    return (
      <div className="flex flex-1 items-center bg-black justify-center text-2xl font-bold text-center text-white min-h-screen">
        Đang tải...
      </div>
    );
  }

  // max selected tickets

  return (
    <div className="flex flex-row flex-1 gap-0 bg-black w-full h-full">
      {/* LEFT */}
      <div className="flex flex-col flex-[7.5] mx-10">
        <div className="flex items-center text-[#2dc275] font-bold text-xl py-8">
          <button
            className="flex items-center gap-3"
            onClick={() => navigate(`/events/${String(id)}`)}
          >
            <svg
              width="20"
              height="21"
              viewBox="0 0 20 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.707 3.793a1 1 0 010 1.414L4.414 9.5H18a1 1 0 110 2H4.414l4.293 4.293a1 1 0 11-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0z"
                fill="#fff"
              ></path>
            </svg>
            Trở về
          </button>
          <p className="mx-auto">Chọn vé</p>
        </div>

        <div className="mx-45">
          <div className="flex items-center justify-between py-2 mx-6">
            <p className="text-white font-bold text-[1.1rem]">Loại vé</p>
            <p className="text-white font-bold text-[1.1rem]">Số lượng</p>
          </div>
          <div className="py-4">
            {event?.ticketTypes.map((ticket) => {
              return (
                <div
                  key={ticket.id}
                  className="flex justify-between items-center py-4 px-4 mx-2 border-b border-dashed border-[#636363]"
                >
                  <div>
                    <h1 className="py-2 text-[#2dc275] font-bold">
                      {ticket.type.toUpperCase()}
                    </h1>
                    <p className="text-white">
                      {ticket.price.toLocaleString("de-DE")} đ
                    </p>
                  </div>

                  <div className="">
                    {ticket.quantity === 0 ? (
                      <div className="text-center bg-red-200 p-1 text-red-600 font-bold rounded-xl">
                        Hết vé
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {/* decrease */}
                        <button
                          className="px-4.5 py-2 font-bold bg-white rounded-md order border-[#2dc275] text-[#2dc275] disabled:text-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
                          onClick={() => handleDecrement(ticket.id)}
                          disabled={!ticketCounts[ticket.id]}
                        >
                          -
                        </button>

                        {/* count */}
                        <p className="min-w-[48px] text-center py-2 bg-white rounded-md">
                          {ticketCounts[ticket.id] || 0}
                        </p>

                        {/* increase */}
                        <button
                          className="px-4.5 py-2 font-bold bg-white rounded-md border border-[#2dc275] text-[#2dc275] disabled:text-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
                          onClick={() => handleIncrement(ticket.id)}
                          disabled={
                            ticketCounts[ticket.id] >= ticket.quantity ||
                            ticketCounts[ticket.id] >= 10
                          }
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex flex-[3] flex-col  bg-[#38383D]">
        {/* ticket title */}
        <div className="font-bold w-full text-white text-xl bg-[#27272A] px-3 py-1">
          {event?.title.toUpperCase()}
        </div>
        {/* location and date */}
        <div className="flex flex-col justify-center gap-5 p-5 border-b border-[#636363]">
          <p className="flex gap-3 items-center text-white text-[0.9rem]">
            <Calendar fontSize={14} color="#2dc275" />
            {event
              ? formatDateTimeDisplay(event.startDate)
              : "Chưa có ngày diễn ra"}
          </p>
          <p className="flex gap-3 items-center text-white text-[0.9rem]">
            <MapPin fontSize={14} color="#2dc275" />
            {event?.location}
          </p>
        </div>
        {/* ticket name and price */}
        <div className="flex flex-col px-3">
          <p className="text-white font-semibold py-5">Giá vé</p>
          <div>
            {event?.ticketTypes.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between text-[0.85rem] py-2 font-semibold"
              >
                <p className="text-white">{ticket.type.toUpperCase()}</p>
                <p className="text-[#2dc275]">
                  {ticket.price.toLocaleString("de-DE")} đ
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* total price */}
        <div className="px-3 flex justify-between items-center border-t border-[#636363] mt-4 pt-4">
          <p className="text-white font-semibold">Tổng cộng</p>
          <p className="text-[#2dc275] font-bold text-lg">
            {totalPrice.toLocaleString("de-DE")} đ
          </p>
        </div>

        {/* footer */}
        <div className="flex flex-col gap-4 bg-[#27272A] px-4 py-6 mt-auto text-white">
          {/* total tickets count */}
          <div
            className={`flex gap-2 items-center${totalSelected > 0 ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
          >
            <Ticket /> x{totalSelected}
          </div>

          <PrimaryColorButton
            title={
              Object.values(ticketCounts).some((count) => count > 0)
                ? `Tiếp tục - ${totalPrice.toLocaleString("de-DE")} đ`
                : "Vui lòng chọn vé"
            }
            fullSize={true}
            onClick={handleAddToCart}
            disabled={
              Object.values(ticketCounts).reduce(
                (sum, count) => sum + count,
                0
              ) === 0
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SelectTicket;
