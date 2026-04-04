import { Link } from "react-router-dom";
import type { Event } from "../../../constants/types/types";

type Props = {
  data: Event;
};

const CarouselItem = ({ data }: Props) => {
  return (
    <Link to={`/events/${data.id}`}>
      <div className="relative px-1.5 overflow-hidden rounded-xl group">
        <img
          src={data?.bannerUrl?.startsWith('http') ? data.bannerUrl : `/images/event/${data?.bannerUrl}`}
          alt={data.title}
          className="w-full h-full object-cover rounded-xl transform transition-transform duration-500 group-hover:scale-102 aspect-[16/9]"
        />
        <button className="absolute flex items-center bottom-4 left-6 px-4.5 py-1.5 bg-white rounded-sm hover:bg-[#2dc275] hover:text-white font-semibold transition-colors duration-500">
          Xem chi tiết
        </button>
      </div>
    </Link>
  );
};

export default CarouselItem;
