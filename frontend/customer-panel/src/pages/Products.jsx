import React, { useEffect, useState, useCallback } from "react";
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

// The specific categories provided
const CATEGORIES = [
  "Electronics",
  "Grocery",
  "Stationery",
  "Fashion",
  "Home & Living",
  "Personal Care",
  "Toys",
  "Health and Fitness",
  "Sports"
];

const Products = () => {
  const { addToCart } = useCart();

  // State
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  // Data Fetching Logic
  const fetchProducts = useCallback(async (pageNum, categoryName, isNewCategory = false) => {
    if (isNewCategory) setLoading(true);
    else setLoadingMore(true);
    
    setError(null);
    try {
      // Constructing query: if "All" is selected, we don't send the category param
      const categoryParam = categoryName === "All" ? "" : `&category=${encodeURIComponent(categoryName)}`;
      const res = await api.get(`/products?page=${pageNum}&limit=${ITEMS_PER_PAGE}${categoryParam}`);
      
      const newData = res.data.items || res.data || [];
      
      if (Array.isArray(newData)) {
        setProducts(prev => isNewCategory ? newData : [...prev, ...newData]);
        // If we received less than the limit, no more data exists on the server
        setHasMore(newData.length === ITEMS_PER_PAGE);
      }
    } catch (err) {
      console.error(err);
      setError("We encountered an error loading products. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Effect: Triggered when category changes
  useEffect(() => {
    setPage(1);
    fetchProducts(1, selectedCategory, true);
  }, [selectedCategory, fetchProducts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, selectedCategory, false);
  };

  const handleAdd = (product) => {
    addToCart({ product, quantity: 1 });
  };

  // Local Search Filter
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* MINIMAL STICKY HEADER */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* CATEGORY SELECT */}
            <div className="w-full sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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

            {/* SEARCH BOX */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded-xl outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {/* INITIAL LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 max-w-lg mx-auto mt-10">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800">{error}</h2>
            <button 
              onClick={() => fetchProducts(1, selectedCategory, true)} 
              className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* PRODUCT GRID */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} addToCart={handleAdd} />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center text-gray-400">
                <PackageOpen size={64} className="mx-auto mb-4 opacity-10" />
                <p className="text-lg">No products found in this section.</p>
              </div>
            )}

            {/* LOAD MORE ACTION */}
            {hasMore && (
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
                  End of Catalog
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