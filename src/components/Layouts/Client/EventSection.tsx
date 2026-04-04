import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "./EventCard";
import { getDisplayPrice } from "../../../utils/getDisplayPrice";
import type { Event } from "../../../constants/types/types";
import axios from "@/utils/axiosInterceptor";

interface EventSectionProps {
  title: string;
  catId?: string;
}

const EventSection = ({ title, catId }: EventSectionProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const url = `/api/events?page=1&limit=4${catId ? `&category=${encodeURIComponent(catId)}` : ""}`;
      try {
        setLoading(true);
        const response = await axios.get(url);
        const result = response.data;
        setEvents(result.events || []);
      } catch (e) {
        console.error(`Lỗi khi fetch sự kiện cho "${title}":`, e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [catId, title]);

  return (
    <div className="mt-6">
      {/* header */}
      <div className="flex flex-row justify-between items-center">
        <p className="text-2xl text-white font-bold mb-6">{title}</p>
        <Link
          to={`search?category=${catId ? encodeURIComponent(title) : ""}`}
          className="flex items-center gap-2 text-[#A6A6B0] hover:text-[#2dc275] transition-colors duration-300"
        >
          Xem thêm
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              // fill-rule="evenodd"
              // clip-rule="evenodd"
              d="M4.529 2.529c.26-.26.682-.26.942 0l4 4c.26.26.26.682 0 .942l-4 4a.667.667 0 01-.942-.942L8.057 7 4.53 3.471a.667.667 0 010-.942z"
            ></path>
          </svg>
        </Link>
      </div>

      {/* cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-[#3f3f46] rounded-xl aspect-[16/9] animate-pulse"
            ></div>
          ))
          : events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              price={getDisplayPrice(event.ticketTypes)}
            />
          ))}
      </div>
    </div>
  );
};

export default EventSection;
