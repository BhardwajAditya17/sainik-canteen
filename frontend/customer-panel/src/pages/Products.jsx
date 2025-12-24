import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { Search, PackageOpen, AlertCircle, ShoppingBag } from "lucide-react";

const Products = () => {
  const { category } = useParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(
          category ? `/products?category=${category}` : "/products"
        );
        const data = res.data.items || res.data || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("We couldn't load the products at this moment.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (product, qty = 1) => {
    addToCart({ product, quantity: qty });
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 capitalize">
              <ShoppingBag className="text-emerald-600" />
              {category ? `${category} Collection` : "All Products"}
            </h1>
            <p className="text-gray-500 mt-1">
              {loading ? "Updating..." : `${filteredProducts.length} items available`}
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-2xl mb-4"></div>
                <div className="px-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Oops! Something went wrong.</h3>
            <p className="text-gray-500 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
            <PackageOpen size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No products found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search or category.</p>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} addToCart={handleAdd} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;
