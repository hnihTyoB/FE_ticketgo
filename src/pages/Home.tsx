// import { events } from "../constants/mocks/mockEventData";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { responsive } from "../components/Base/ResponsiveBase/Carousel";
import EventSection from "../components/Layouts/Client/EventSection";
import { useEffect, useState } from "react";
import type { Event } from "../constants/types/types";
import { categories } from "@/constants/data/categories";
import CategoryFilterBar from "@/components/Layouts/Client/CategoryFilterBar";
import CarouselItem from "@/components/Layouts/Client/CarouselItem";
import axios from "@/utils/axiosInterceptor";

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const url = `/api/events?page=1&limit=8&week=true&month=true`;
      try {
        const response = await axios.get(url);

        const result = response.data;
        setEvents(result.events || []);
      } catch (e) {
        console.error("Lỗi khi fetch sự kiện cho carousel:", e);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full mx-auto bg-[#27272A]">
      {/* category filter */}
      <CategoryFilterBar data={categories} />

      {/* body */}
      <div className="mx-5 lg:mx-auto max-w-[1250px] py-8">
        {/*   CAROUSEL SECTION*/}
        <div className="mx-auto mb-8">
          <Carousel
            swipeable
            draggable
            showDots={false}
            responsive={responsive}
            ssr={true}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={8000}
            keyBoardControl={true}
            customTransition="transform 500ms"
            transitionDuration={500}
            containerClass="flex carousel-container"
            removeArrowOnDeviceType={["tablet", "mobile"]}
            partialVisible={false}
          >
            {events.map((event) => (
              <CarouselItem key={event.id} data={event} />
            ))}
          </Carousel>
        </div>

        {categories.map((cat) => (
          <EventSection
            key={cat.id ?? cat.label}
            title={cat.label}
            catId={cat.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
