import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { 
  Search, 
  PackageOpen, 
  AlertCircle, 
  Loader2, 
  ChevronDown 
} from "lucide-react";

const CATEGORIES = [
  "Electronics", "Grocery", "Stationery", "Fashion", 
  "Home & Living", "Personal Care", "Toys", 
  "Health and Fitness", "Sports"
];

const Products = () => {
  const { addToCart } = useCart();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0); // Production-level meta info
  const ITEMS_PER_PAGE = 10;

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory("All");
    }
  }, [urlCategory]);

  const fetchProducts = useCallback(async (pageNum, categoryName, isNewCategory = false, searchQ = "") => {
    if (isNewCategory) setLoading(true);
    else setLoadingMore(true);
    
    setError(null);
    try {
      const categoryParam = categoryName === "All" ? "" : `&category=${encodeURIComponent(categoryName)}`;
      const searchParam = searchQ ? `&search=${encodeURIComponent(searchQ)}` : "";
      
      const res = await api.get(`/products?page=${pageNum}&limit=${ITEMS_PER_PAGE}${categoryParam}${searchParam}`);
      
      // Handle production-level response structure
      const newData = res.data.items || [];
      const serverHasMore = res.data.hasMore ?? (newData.length === ITEMS_PER_PAGE);
      
      setProducts(prev => isNewCategory ? newData : [...prev, ...newData]);
      setHasMore(serverHasMore);
      setTotalResults(res.data.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to load products. Check your connection.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Trigger fetch when category OR debounced search term changes
  useEffect(() => {
    setPage(1);
    fetchProducts(1, selectedCategory, true, debouncedSearchTerm);
  }, [selectedCategory, debouncedSearchTerm, fetchProducts]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setSearchParams(value === "All" ? {} : { category: value });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, selectedCategory, false, debouncedSearchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* SEARCH & FILTER BAR */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            
            <div className="w-full sm:w-64">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all cursor-pointer appearance-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                }}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products, brands..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {/* Results Counter */}
        {!loading && !error && products.length > 0 && (
          <p className="mb-6 text-sm text-gray-500 font-medium">
            Showing {products.length} of {totalResults} products
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 max-w-lg mx-auto mt-10">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800">{error}</h2>
            <button 
              onClick={() => fetchProducts(1, selectedCategory, true, debouncedSearchTerm)} 
              className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id || p._id} product={p} />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center text-gray-400">
                <PackageOpen size={64} className="mx-auto mb-4 opacity-10" />
                <p className="text-lg">No products match your criteria.</p>
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm("")}
                        className="mt-2 text-emerald-600 font-bold hover:underline"
                    >
                        Clear Search
                    </button>
                )}
              </div>
            )}

            {hasMore && products.length > 0 && (
              <div className="mt-16 mb-12 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-10 py-3 bg-white border-2 border-emerald-600 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <ChevronDown size={20} />
                    </>
                  )}
                </button>
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <div className="mt-12 text-center">
                <span className="px-4 py-1 bg-gray-100 text-gray-400 text-xs uppercase tracking-widest rounded-full">
                  You've reached the end
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;