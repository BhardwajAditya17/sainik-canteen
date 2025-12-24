import React from 'react';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 text-center">
      
      {/* Icon */}
      <div className="bg-emerald-50 p-6 rounded-full mb-4">
        <FileQuestion className="h-16 w-16 text-emerald-600" />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Page Not Found
      </h1>

      {/* Description */}
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>

      {/* Action Button */}
      <Link 
        to="/dashboard" 
        className="bg-emerald-600 hover:bg-emerald-700 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                   text-white px-6 py-3 rounded-lg font-medium 
                   flex items-center gap-2 transition-colors shadow-sm"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
