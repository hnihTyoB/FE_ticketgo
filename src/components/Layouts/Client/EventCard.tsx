import React from "react";
import { Link } from "react-router-dom";
import type { Event } from "../../../constants/types/types";
import { Calendar } from "lucide-react";
import { formatCurrency, formatDateTimeDisplay } from "../../../utils/utils";

type EventProps = {
  event: Event;
  price: number | null;
};

const EventCard: React.FC<EventProps> = ({ event, price }) => {
  return (
    <Link to={`/events/${Number(event.id)}`}>
      <div className="max-w-xl bg-transparent rounded-xl overflow-hidden hover:shadow-md hover:shadow-[#2dc275] transition-shadow duration-400 h-full flex flex-col">
        <div className="overflow-hidden rounded-xl mb-3 aspect-[16/9]">
          <img
            src={event?.bannerUrl?.startsWith('http') ? event.bannerUrl : `/images/event/${event?.bannerUrl}`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-2 flex flex-col justify-between flex-grow">
          <h3 className="text-md font-semibold mb-2 text-white line-clamp-2 min-h-[3rem]">
            {event.title}
          </h3>
          <p className="text-[#2dc275] text-md mb-2 font-semibold line-clamp-1">
            Từ {formatCurrency(price || 0)}
          </p>
          <p className="flex items-center gap-2 text-md text-white line-clamp-1">
            <Calendar size={14} /> {formatDateTimeDisplay(event.startDate)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
