import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
        <p className="text-2xl md:text-3xl font-light text-slate-800 mt-4">
          Sorry, we couldn't find this page.
        </p>
        <p className="mt-4 text-slate-500">
          But don't worry, you can find plenty of other things on our homepage.
        </p>
        <Link
          to="/login"
          className="inline-block mt-6 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;