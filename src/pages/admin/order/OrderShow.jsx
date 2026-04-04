import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Layouts/admin/components/Pagination.jsx";
import axios from "@/utils/axiosInterceptor";
import { STATUS_ORDERS } from "../../../constants/data/constant.js";

export default function OrderShow() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses] = useState(Object.values(STATUS_ORDERS));

  useEffect(() => {
    const fetchOrders = async (page) => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`/api/orders?page=${page}&limit=7`);
        const data = res.data;

        const fetchedOrders = data.orders || data.data || [];
        const pages = data.totalPages || data.total_pages || 1;

        setOrders(fetchedOrders);
        setTotalPages(pages);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders(page);
  }, [page]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      await axios.put(`/api/orders/${orderId}/`, { status: newStatus });
      console.log("Status updated:", newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold mb-2">Manage Orders</h1>

      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex space-x-2">
          <li>
            <Link to="/admin" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="ms-2">/</span>
          </li>
          <li className="text-gray-700">Orders</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold">Table orders:</h5>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-900 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Total Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Payment Method</th>
              <th className="px-6 py-3">Payment Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-red-500">
                  Error: {error}
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="odd:bg-white even:bg-gray-50 border-b"
                >
                  <th className="px-6 py-4 font-medium text-gray-900">
                    {order.id}
                  </th>
                  <td className="px-6 py-4">{order.user.fullName || "N/A"}</td>
                  <td className="px-6 py-4">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.totalPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      name="status"
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                      {Array.isArray(statuses) &&
                        statuses.map((status, index) => (
                          <option key={index} value={status}>
                            {status}
                          </option>
                        ))}
                    </select>
                  </td>

                  <td className="px-6 py-4">{order.paymentMethod}</td>
                  <td className="px-6 py-4">{order.paymentStatus}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/order-detail/${order.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
