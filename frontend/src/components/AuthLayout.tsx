"use client";

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, imageSrc, imageAlt }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image: ${imageSrc}`, e);
    e.currentTarget.src = '/placeholder.svg'; // Fallback to a generic placeholder if the specific one fails
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="relative w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-lg shadow-xl bg-white dark:bg-gray-800">
        {/* Left side for the form */}
        <div className="flex items-center justify-center p-8">
          {children}
        </div>

        {/* Right side for the image (hidden on small screens) */}
        <div className="hidden md:flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-4">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-h-[400px] w-auto object-contain rounded-lg"
            onError={handleImageError} // Added error handler
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;