import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInterceptor";
import { CATEGORIES } from "../../../constants/data/constant.js";
import { formatCurrency } from "@/utils/utils";
import { toast } from "sonner";

export default function EventCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    startDate: "",
    startTime: "",
    endTime: "",
    organizer: "",
    bannerUrl: null,
  });
  const [bannerPreview, setBannerPreview] = useState(null);
  const [categories] = useState(Object.values(CATEGORIES));
  const [errors, setErrors] = useState({});

  const [showTicketPopup, setShowTicketPopup] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [newTicket, setNewTicket] = useState({
    type: "",
    price: "",
    quantity: "",
    description: "",
  });
  const [updateTicket, setUpdateTicket] = useState({
    type: "",
    price: "",
    quantity: "",
    description: "",
  });
  const [newTicketErrors, setNewTicketErrors] = useState({});
  const [updateTicketErrors, setUpdateTicketErrors] = useState({});

  const handleTicketInput = (e) => {
    const { name, value } = e.target;
    setNewTicket({ ...newTicket, [name]: value });

    if (newTicketErrors[name]) {
      setNewTicketErrors({ ...newTicketErrors, [name]: "" });
    }
  };

  const handleUpdateTicketInput = (e) => {
    const { name, value } = e.target;
    setUpdateTicket((prev) => ({ ...prev, [name]: value }));

    if (updateTicketErrors[name]) {
      setUpdateTicketErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleUpdateTicketFields = useCallback((ticket) => {
    setUpdateTicket({
      type: ticket.type,
      price: ticket.price,
      quantity: ticket.quantity,
      description: ticket.description,
    });
    setUpdateTicketErrors({});
  }, []);

  const handleAddTicket = (e) => {
    e.preventDefault();

    setNewTicketErrors({});

    const errors = {};

    if (!newTicket.type || !newTicket.type.trim()) {
      errors.type = "Loại vé không được để trống";
    } else if (newTicket.type.length > 100) {
      errors.type = "Loại vé không được quá 100 ký tự";
    }

    if (!newTicket.price || Number.isNaN(Number(newTicket.price))) {
      errors.price = "Giá vé phải là số nguyên";
    } else if (Number(newTicket.price) <= 0) {
      errors.price = "Giá vé không được âm";
    }

    if (!newTicket.quantity || Number.isNaN(Number(newTicket.quantity))) {
      errors.quantity = "Số lượng vé phải là số nguyên";
    } else if (Number(newTicket.quantity) <= 0) {
      errors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (!newTicket.description || newTicket.description.length < 5) {
      errors.description = "Mô tả vé phải có ít nhất 5 ký tự";
    }

    if (Object.keys(errors).length > 0) {
      setNewTicketErrors(errors);
      return false;
    }

    const newTicketData = {
      id: Date.now(),
      type: newTicket.type,
      price: Number(newTicket.price),
      quantity: Number(newTicket.quantity),
      description: newTicket.description,
      sold: 0,
    };

    setTicketTypes([...ticketTypes, newTicketData]);
    setNewTicket({ type: "", price: "", quantity: "", description: "" });
    setNewTicketErrors({});
    return true;
  };

  const handleUpdateTicket = (ticketId, updatedData) => {
    setUpdateTicketErrors({});

    const errors = {};

    if (!updatedData.type || !updatedData.type.trim()) {
      errors.type = "Loại vé không được để trống";
    } else if (updatedData.type.length > 100) {
      errors.type = "Loại vé không được quá 100 ký tự";
    }

    if (!updatedData.price || Number.isNaN(Number(updatedData.price))) {
      errors.price = "Giá vé phải là số nguyên";
    } else if (Number(updatedData.price) <= 0) {
      errors.price = "Giá vé không được âm";
    }

    if (!updatedData.quantity || Number.isNaN(Number(updatedData.quantity))) {
      errors.quantity = "Số lượng vé phải là số nguyên";
    } else if (Number(updatedData.quantity) <= 0) {
      errors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (!updatedData.description || updatedData.description.length < 5) {
      errors.description = "Mô tả vé phải có ít nhất 5 ký tự";
    }

    if (Object.keys(errors).length > 0) {
      setUpdateTicketErrors(errors);
      return false;
    }

    setTicketTypes(
      ticketTypes.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              type: updatedData.type,
              price: Number(updatedData.price),
              quantity: Number(updatedData.quantity),
              description: updatedData.description,
            }
          : ticket,
      ),
    );
    setUpdateTicket({ type: "", price: "", quantity: "", description: "" });
    setUpdateTicketErrors({});
    return true;
  };

  const handleDeleteTicket = (ticketId) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      setTicketTypes(ticketTypes.filter((t) => t.id !== ticketId));
    }
  };

  const formatDateTimeDisplay = (date, startTime, endTime) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    if (startTime && endTime) {
      return `${formattedDate} [ ${startTime} - ${endTime} ]`;
    } else if (startTime) {
      return `${formattedDate} ${startTime}`;
    }

    return formattedDate;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "bannerUrl" && files.length > 0) {
      setFormData({ ...formData, bannerUrl: files[0] });
      setBannerPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setFormData({ ...formData, bannerUrl: file });
        setBannerPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("category", formData.category);
      form.append("startDate", formData.startDate);

      if (formData.startTime && formData.endTime) {
        form.append("duration", `${formData.startTime} - ${formData.endTime}`);
      } else if (formData.startTime) {
        form.append("duration", formData.startTime);
      } else {
        form.append("duration", "");
      }

      form.append("organizer", formData.organizer);
      form.append("location", formData.location);

      if (formData.bannerUrl) {
        form.append("bannerUrl", formData.bannerUrl);
      }

      // console.log("FormData contents:");
      // for (let [key, value] of form.entries()) {
      //   console.log(key, value);
      // }

      const eventResponse = await axios.post("/api/events", form);

      const eventId = eventResponse.data.event.id;

      if (ticketTypes.length > 0) {
        for (const ticket of ticketTypes) {
          try {
            await axios.post(`/api/tickets/${eventId}`, {
              type: ticket.type,
              price: ticket.price,
              quantity: ticket.quantity,
              description: ticket.description,
            });
          } catch (ticketErr) {
            console.error("Error creating ticket:", ticketErr);
            if (ticketErr.response?.data?.errors) {
              console.log(
                "Ticket validation errors:",
                ticketErr.response.data.errors,
              );
            }
          }
        }
      }

      toast.success("Event created successfully!");
      navigate("/admin/events");
    } catch (err) {
      console.error("Backend Error Response:", err.response?.data || err.message);
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach((error) => {
          if (error.path === "title") backendErrors.title = error.message;
          else if (error.path === "description")
            backendErrors.description = error.message;
          else if (error.path === "category")
            backendErrors.category = error.message;
          else if (error.path === "location")
            backendErrors.location = error.message;
          else if (error.path === "startDate")
            backendErrors.startDate = error.message;
          else if (error.path === "duration")
            backendErrors.duration = error.message;
          else if (error.path === "organizer")
            backendErrors.organizer = error.message;
          else if (error.path === "bannerUrl")
            backendErrors.bannerUrl = error.message;
        });
        setErrors(backendErrors);
      } else {
        toast.error(
          "Failed to create event: " +
            (err.response?.data?.message || err.message),
        );
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Manage Events</h1>
      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link to="/admin" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li>
            <Link to="/admin/events" className="text-blue-600 hover:underline">
              Events
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li className="text-gray-700">Create A Event</li>
        </ol>
      </nav>

      <h5 className="text-lg font-semibold mb-6 max-w-2xl mx-auto">
        Create A Event
      </h5>

      {/* Error */}
      {/* {Array.isArray(errors) &&
        errors.length > 0 &&
        errors.map((error, idx) => (
          <div
            key={idx}
            className="mx-auto max-w-2xl mb-6 rounded-lg border border-red-400 bg-red-100 p-2.5 font-medium text-red-700"
            role="alert"
          >
            {error}
          </div>
        ))} */}

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Title:
            {errors.title && (
              <span className="text-red-500 text-xs mt-1">
                {" "}
                * {errors.title}
              </span>
            )}
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`bg-gray-50 border text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Description:
            {errors.description && (
              <span className="text-red-500 text-xs mt-1">
                {" "}
                * {errors.description}
              </span>
            )}
          </label>
          <textarea
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className={`bg-gray-50 border text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Category:
            {errors.category && (
              <span className="text-red-500 text-xs mt-1">
                {" "}
                * {errors.category}
              </span>
            )}
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`bg-gray-50 border text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">-- Select category --</option>
            {Array.isArray(categories) &&
              categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Location:
            {errors.location && (
              <span className="text-red-500 text-xs mt-1">
                {" "}
                * {errors.location}
              </span>
            )}
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`bg-gray-50 border text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
              errors.location ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Event Time:
            {errors.startDate && (
              <span className="text-red-500 text-xs mt-1">
                {" "}
                * {errors.startDate}
              </span>
            )}
            {errors.duration && (
              <span className="text-red-500 text-xs mt-1">
                {" "}
                * {errors.duration}
              </span>
            )}
          </label>
          <div
            className={`bg-gray-100 border text-gray-900 text-sm rounded-lg p-2.5 ${
              errors.startDate || errors.duration
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            {formatDateTimeDisplay(
              formData.startDate,
              formData.startTime,
              formData.endTime,
            ) || "Chưa có thông tin thời gian"}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Start Date:
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Start Time:
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              End Time:
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Organizer:
            {errors.organizer && (
              <span className="text-red-500 text-xs mt-1">
                {" "}
                * {errors.organizer}
              </span>
            )}
          </label>
          <input
            type="text"
            name="organizer"
            value={formData.organizer}
            onChange={handleChange}
            className={`bg-gray-50 border text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
              errors.organizer ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Banner:
            {errors.bannerUrl && (
              <span className="text-red-500 text-xs mt-1">
                {" "}
                * {errors.bannerUrl}
              </span>
            )}
          </label>

          <div className="flex flex-col items-center justify-center w-full">
            <label
              htmlFor="bannerUrl"
              className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition ${
                errors.bannerUrl ? "border-red-500" : "border-gray-300"
              }`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
            >
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="banner preview"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <svg
                    className="w-8 h-8 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9H7z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">Thêm ảnh nền sự kiện</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Ảnh tối thiểu <span className="font-bold">1280×720</span>{" "}
                    (.PNG, .JPG, .JPEG)
                  </p>
                </div>
              )}
              <input
                id="bannerUrl"
                type="file"
                name="bannerUrl"
                accept=".png, .jpg, .jpeg"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTicketPopup(true)}
          className="px-4 py-2 mb-5 w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Loại vé
        </button>

        <button
          type="submit"
          className="px-4 py-2 shadow-lg shadow-gray-400 w-full sticky bottom-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer flex-1"
        >
          Create
        </button>
      </form>

      {/* <TicketManagement
        newTicketErrors={newTicketErrors}
        updateTicketErrors={updateTicketErrors}
        showTicketPopup={showTicketPopup}
        setShowTicketPopup={setShowTicketPopup}
        newTicket={newTicket}
        updateTicket={updateTicket}
        handleTicketInput={handleTicketInput}
        handleUpdateTicketInput={handleUpdateTicketInput}
        handleUpdateTicketFields={handleUpdateTicketFields}
        handleAddTicket={handleAddTicket}
        handleUpdateTicket={handleUpdateTicket}
        handleDeleteTicket={handleDeleteTicket}
        ticketTypes={ticketTypes}
        formatCurrency={formatCurrency}
        showStatistics={false}
      /> */}
    </div>
  );
}
