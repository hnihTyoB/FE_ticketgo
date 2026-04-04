import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "@/utils/axiosInterceptor";
import { formatCurrency } from "@/utils/utils";

export default function OrderDetail() {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(`/api/orders/${id}`);
        setOrderDetails(res.data.orderDetails?.ticketOrderDetails || []);
      } catch (err) {
        console.error("Error fetching order details:", err);
      }
    };

    fetchOrderDetails();
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Manage Orders</h1>

      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link to="/admin" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li>
            <Link to="/admin/orders" className="text-blue-600 hover:underline">
              Orders
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li className="text-gray-700">Order Details</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold">
          Order details ID: <span className="text-green-600 text-lg">{id}</span>
        </h5>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-900 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Event</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Quantity</th>
              <th className="px-6 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.length > 0 ? (
              orderDetails.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <img
                      src={item.ticketType.event.bannerUrl}
                      alt={item.ticketType.event.title}
                      className="w-35 h-20 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <Link
                      to={`/events/${item.ticketType.event.id}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {item.ticketType.event.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{item.ticketType.type}</td>
                  <td className="px-6 py-4">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4 font-semibold">
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No ticket found in this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {orderDetails.length > 0 && (
        <div className="sticky bottom-8 z-10 flex justify-end mt-6">
          <div className=" bg-gray-50 border border-gray-200 rounded-lg px-5 py-3 shadow-lg shadow-gray-400">
            <p className="text-gray-700 font-semibold">
              Total:{" "}
              <span className="text-green-600 text-lg">
                {formatCurrency(
                  orderDetails.reduce(
                    (sum, item) => sum + item.quantity * item.price,
                    0
                  )
                )}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
