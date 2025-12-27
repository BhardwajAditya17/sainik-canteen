import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { CartContext } from "../context/CartContext";
import { ArrowLeft, ShoppingCart, Star, Share2, Plus, Minus } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  // Added Quantity State
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      // Pass both product ID and selected quantity
      await addToCart(product.id, quantity);
      alert("Added to cart!");
    } catch (error) {
      alert("Failed to add item.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center p-10">
      <p className="text-gray-500 text-lg">Product not found.</p>
      <button 
        onClick={() => navigate(-1)} 
        className="mt-4 text-emerald-600 font-semibold underline"
      >
        Go Back
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            
            {/* IMAGE SECTION */}
            <div className="w-full bg-gray-100 flex items-center justify-center p-6 md:p-10 relative">
              {product.image && product.image.startsWith('http') ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-h-[400px] w-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300" 
                />
              ) : (
                <div className="text-9xl">{product.image || '📦'}</div>
              )}

              {/* Floating Share Button */}
              <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 text-gray-500">
                <Share2 size={20} />
              </button>
            </div>

            {/* PRODUCT INFO */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              
              {/* Category */}
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-emerald-800 uppercase bg-emerald-100 rounded-full w-fit mb-3">
                {product.category || "General"}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Price */}
              <p className="text-3xl font-bold text-emerald-600 mb-6">
                ₹{product.price}
              </p>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {product.description || "No description available for this product."}
              </p>

              {/* Stock */}
              <div className="mb-6">
                <span className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : "Currently Out of Stock"}
                </span>
              </div>

              {/* QUANTITY SELECTOR */}
              {product.stock > 0 && (
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Select Quantity
                  </label>
                  <div className="flex items-center w-32 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border-r"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setQuantity(Math.min(product.stock, Math.max(1, val)));
                      }}
                      className="w-full text-center font-bold text-gray-800 bg-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border-l"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart} 
                disabled={adding || product.stock <= 0}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl text-white shadow-lg transition-all transform active:scale-95
                  ${adding || product.stock <= 0 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30"
                  }`}
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingCart size={22} />
                    Add to Cart
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;