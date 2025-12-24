import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { CartContext } from "../context/CartContext";
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Phone,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success && res.data.order) {
          setOrder(res.data.order);
        } else {
          setOrder(res.data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleReorder = async () => {
    if (!order) return;
    const items = order.orderItems || [];
    for (const item of items) {
      const prodId = item.productId || item.product?.id || item.product?._id;
      if (prodId) await addToCart(prodId);
    }
    alert("Items added to cart");
    navigate("/cart");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Order Not Found</h2>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 text-emerald-600 font-semibold underline"
        >
          Back to Orders
        </button>
      </div>
    );

  const {
    address,
    city,
    pincode,
    state,
    phone,
    name,
    orderItems = [],
    totalAmount,
    status,
    paymentMethod,
    paymentStatus,
    createdAt,
  } = order;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-2"
            >
              <ArrowLeft size={18} /> Back to Orders
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-gray-900">
                Order #{order.id}
              </h1>
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                {status || "Pending"}
              </span>
            </div>

            <p className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Calendar size={14} />
              Placed on {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={handleReorder}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg hover:shadow-emerald-500/30"
          >
            <RefreshCw size={18} />
            Buy Again
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* ITEMS */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
              <Package size={18} className="text-emerald-600" />
              <h3 className="font-bold text-gray-800">
                Order Items ({orderItems.length})
              </h3>
            </div>

            <div className="divide-y">
              {orderItems.map((item, index) => {
                const product = item.product || {};
                const img =
                  product.image ||
                  product.imageUrl ||
                  "https://placehold.co/100";

                return (
                  <div
                    key={index}
                    className="p-6 flex gap-4 hover:bg-gray-50 transition"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-xl border flex items-center justify-center">
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {product.name || "Product"}
                      </h4>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg text-gray-600">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-extrabold text-gray-900">
                          ₹{Number(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            
            {/* ADDRESS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-emerald-600" />
                Delivery Address
              </h3>

              <div className="text-sm text-gray-600 leading-relaxed">
                <p className="font-bold text-gray-900">{name}</p>
                <p>{address}</p>
                <p>
                  {city}, {state}
                </p>
                <p className="font-mono text-gray-500 mt-1">
                  PIN: {pincode}
                </p>

                {phone && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-gray-500">
                    <Phone size={14} />
                    {phone}
                  </div>
                )}
              </div>
            </div>

            {/* PAYMENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                Payment Info
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold uppercase">
                    {paymentMethod || "COD"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-bold ${
                      String(paymentStatus).toLowerCase() === "paid"
                        ? "text-emerald-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {paymentStatus || "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
              <h3 className="font-bold text-emerald-800 mb-4">
                Order Summary
              </h3>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-emerald-700">
                  ₹{Number(totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
