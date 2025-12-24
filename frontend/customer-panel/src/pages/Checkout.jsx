// frontend/src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Truck, MapPin, User, Phone, 
  ShieldCheck, Lock, ArrowRight, Home 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const items = Array.isArray(cart) ? cart : [];
  const finalTotal = total || items.reduce((s, item) => s + Number(item.product?.price || 0) * item.quantity, 0);

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    try {
      const orderResponse = await api.post('/orders/create-razorpay-order', {
        amount: finalTotal
      });

      const { orderId, amount, currency } = orderResponse.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, 
        amount,
        currency,
        name: 'Sainik Canteen',
        description: 'Secure Payment',
        image: '/SKlogo.png',
        order_id: orderId,
        handler: async function (response) {
          try {
            await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            await createOrder({
              paymentMethod: 'razorpay',
              paymentResult: {
                id: response.razorpay_payment_id,
                status: 'COMPLETED',
                email_address: user?.email
              }
            });
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed! Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: user?.email,
          contact: formData.phone
        },
        theme: { color: '#059669' } // emerald-600
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      alert('Failed to initiate payment.');
    }
  };

  const createOrder = async (paymentData = {}) => {
    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        paymentMethod: paymentMethod === 'razorpay' ? 'razorpay' : 'cod',
        ...paymentData
      };

      const response = await api.post('/orders', payload);
      await clearCart(); 
      alert('Order placed successfully!');
      
      const newOrderId = response.data.order?.id;
      navigate(newOrderId ? `/orders` : '/orders'); 
    } catch (error) {
      console.error('Create order error:', error);
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      alert('Please fill all delivery details');
      return;
    }

    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      await createOrder({ paymentMethod: 'COD' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="text-emerald-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: DETAILS & PAYMENT */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Shipping Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">1</div>
                Shipping Information
              </h2>
              
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User size={16} /> Full Name
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone size={16} /> Phone Number
                    </label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={16} /> Address
                  </label>
                  <textarea name="address" value={formData.address} onChange={handleChange} required rows="2"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-sm font-medium text-gray-700">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">2</div>
                Payment Method
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <label className={`relative flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === 'razorpay' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}>
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
                  <div className="ml-3">
                    <span className="block font-bold text-gray-800 flex items-center gap-2">
                      <CreditCard size={18} /> Online Payment
                    </span>
                    <span className="text-sm text-gray-500 mt-1 block">UPI, Cards, Netbanking</span>
                  </div>
                </label>

                <label className={`relative flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
                  <div className="ml-3">
                    <span className="block font-bold text-gray-800 flex items-center gap-2">
                      <Truck size={18} /> Cash on Delivery
                    </span>
                    <span className="text-sm text-gray-500 mt-1 block">Pay when it arrives</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4 pb-4 border-b">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                       {item.product?.image && item.product.image.startsWith('http') ? (
                          <img src={item.product.image} alt="" className="w-10 h-10 object-contain mix-blend-multiply" />
                       ) : <Home size={16} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-200 mt-4 pt-4 mb-6">
                <span className="text-base font-bold text-gray-800">Total to Pay</span>
                <span className="text-2xl font-bold text-emerald-700">₹{finalTotal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                   <span className="animate-pulse">Processing Order...</span>
                ) : (
                   <>Pay Securely <ArrowRight size={20} /></>
                )}
              </button>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;