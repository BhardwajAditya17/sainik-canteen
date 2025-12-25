import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Truck, ShieldCheck, Clock, Star, 
  ShoppingBag, MapPin, ChevronLeft, ChevronRight 
} from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  { title: "Electronics", img: "📱" },
  { title: "Grocery", img: "🥦" },
  { title: "Stationery", img: "✏️" },
  { title: "Fashion", img: "👕" },
  { title: "Home & Living", img: "🏠" },
  { title: "Personal Care", img: "🧴" },
  { title: "Toys", img: "🧸" },
  { title: "Health and Fitness", img: "🧘" },
  { title: "Sports", img: "⚽" },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products?limit=8");
        const data = res.data.items || res.data.products || res.data || [];
        setFeatured(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // 🔹 AUTO SLIDE EFFECT (added)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === CATEGORIES.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Infinite Cycle Logic
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === CATEGORIES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? CATEGORIES.length - 1 : prev - 1));
  };

  const handleAdd = (product) => {
    addToCart({ product, quantity: 1 });
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="md:w-1/2 text-center md:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-sm font-semibold tracking-wide border border-emerald-400/30">
                <MapPin size={20} />
                <span>Baghpat</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Quality Products
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold text-emerald-300">
                Shop with comfort
              </h2>
              <p className="text-emerald-100 text-lg md:text-xl max-w-lg mx-auto md:mx-0">
                Exclusive deals on groceries, electronics, and daily essentials.
                Served with pride and integrity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <Link
                  to="/products"
                  className="px-8 py-4 bg-white text-emerald-800 rounded-xl font-bold text-lg hover:bg-emerald-50 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Shop Now <ShoppingBag size={20} />
                </Link>
                <Link
                  to="/orders"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
                >
                  Track Order
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <img
                  src="/SKLogo.png"
                  alt="Shopping"
                  className="relative z-10 w-72 md:w-96 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl grid grid-cols-2 md:grid-cols-4 overflow-hidden">
          <FeatureCard icon={<Truck className="text-emerald-600" size={32} />} title="Fast Delivery" desc="To your doorstep" />
          <FeatureCard icon={<ShieldCheck className="text-emerald-600" size={32} />} title="Secure Payment" desc="100% Safe" />
          <FeatureCard icon={<Star className="text-emerald-600" size={32} />} title="Best Quality" desc="Original Products" />
          <FeatureCard icon={<Clock className="text-emerald-600" size={32} />} title="24/7 Support" desc="Always here" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* SHOP BY CATEGORY CAROUSEL */}
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          Shop by category
        </h2>

        <div className="mb-16 relative group">
          <div className="relative h-[300px] overflow-hidden bg-white rounded-xl">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {CATEGORIES.map((cat, index) => (
                <div key={index} className="min-w-full h-full flex items-center justify-center">
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.title)}`}
                    className="flex flex-col items-center justify-center space-y-4"
                  >
                    <span className="text-8xl">{cat.img}</span>
                    <span className="text-2xl font-black uppercase tracking-tighter">
                      {cat.title}
                    </span>
                  </Link>
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-0 top-0 bottom-0 px-6 bg-transparent text-gray-300 hover:text-emerald-700 transition-colors z-10"
            >
              <ChevronLeft size={48} strokeWidth={3} />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-0 bottom-0 px-6 bg-transparent text-gray-300 hover:text-emerald-700 transition-colors z-10"
            >
              <ChevronRight size={48} strokeWidth={3} />
            </button>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            {CATEGORIES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-emerald-700 scale-125"
                    : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Featured Products
              </h2>
              <p className="text-slate-500 mt-1">
                Handpicked items just for you
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center text-emerald-600 font-semibold hover:text-emerald-700"
            >
              View All <ArrowRight size={20} className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {featured.length > 0 ? (
                featured.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAdd={() => handleAdd(p)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-slate-500 bg-white rounded-xl">
                  No featured products available at the moment.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center p-6 hover:bg-emerald-50/50 transition-colors">
    <div className="mb-3 p-3 bg-emerald-50 rounded-full">{icon}</div>
    <h3 className="font-bold text-slate-900">{title}</h3>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

export default Home;
