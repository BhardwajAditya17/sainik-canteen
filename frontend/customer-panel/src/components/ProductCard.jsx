import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Package } from "lucide-react";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const [adding, setAdding] = useState(false);

  const hasValidImage = product.image && product.image.startsWith("http");
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    try {
      const id = product.id || product._id;
      await addToCart(id, 1);
    } catch (error) {
      console.error("Quick add failed", error);
    } finally {
      setTimeout(() => setAdding(false), 500);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative flex flex-col bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full"
    >
      {/* IMAGE */}
      <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
        {hasValidImage ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <Package size={48} className="mb-2" />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            Out of Stock
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
          {product.category || "General"}
        </div>

        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {product.description || "No description available for this item."}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Price</span>
            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || adding}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-sm
              ${isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : adding
                ? "bg-emerald-600 text-white cursor-wait"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
              }`}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
          >
            {adding ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <ShoppingCart size={18} />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
