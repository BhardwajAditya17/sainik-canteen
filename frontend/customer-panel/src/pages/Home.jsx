import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Clock, Star, ShoppingBag } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";

const Home = () => {
  const [featured, setFeatured] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

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
              <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-sm font-semibold tracking-wide border border-emerald-400/30">
                Official Canteen Service
              </span>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Quality Products
              </h1>

              <h2 className="text-xl md:text-2xl font-semibold text-emerald-300">
                CSD Price Available
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

            {/* Hero Image */}
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
        <div className="bg-white rounded-2xl shadow-xl grid grid-cols-2 md:grid-cols-4">
          <FeatureCard icon={<Truck className="text-emerald-600" size={32} />} title="Fast Delivery" desc="To your doorstep" />
          <FeatureCard icon={<ShieldCheck className="text-emerald-600" size={32} />} title="Secure Payment" desc="100% Safe" />
          <FeatureCard icon={<Star className="text-emerald-600" size={32} />} title="Best Quality" desc="Original Products" />
          <FeatureCard icon={<Clock className="text-emerald-600" size={32} />} title="24/7 Support" desc="Always here" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">

        {/* CATEGORIES */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CategoryCard title="Groceries" img="🥦" to="/products/groceries" />
            <CategoryCard title="Electronics" img="📱" to="/products/electronics" />
            <CategoryCard title="Fashion" img="👕" to="/products/fashion" />
            <CategoryCard title="Home" img="🏠" to="/products/home" />
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-slate-500 mt-1">Handpicked items just for you</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-emerald-600 font-semibold hover:text-emerald-700">
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

          <div className="mt-8 md:hidden text-center">
            <Link to="/products" className="inline-block w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">
              View All Products
            </Link>
          </div>
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

const CategoryCard = ({ title, img, to }) => (
  <Link
    to={to}
    className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all text-center"
  >
    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">
      {img}
    </div>
    <h3 className="font-semibold text-slate-800">{title}</h3>
  </Link>
);

export default Home;
