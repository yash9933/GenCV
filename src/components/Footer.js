'use client';

import React from 'react';

/**
 * Footer Component
 * Reusable footer for all pages
 */
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-400 mb-2">
            Built with ❤️ by Yash
          </p>
          <p className="text-gray-400 mb-4">
            Powered by Next.js, Tailwind CSS, and AI
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <span>Privacy-First</span>
            <span>•</span>
            <span>No Data Storage</span>
            <span>•</span>
            <span>Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
