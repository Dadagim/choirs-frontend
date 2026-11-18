import React from "react";

const GradientSpinner = ({ size = "md" }) => {
  const sizeMap = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${selectedSize} animate-spin rounded-full border-gray-200 border-t-indigo-600`}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default GradientSpinner;