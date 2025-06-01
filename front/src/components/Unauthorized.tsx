import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const ErrorPage = () => {
  const location = useLocation();
  const errorState = location.state || {};

  const errorCode = errorState.code || 404;
  let errorMessage = errorState.message || "Not Found";

  if (errorCode === 401) {
    errorMessage = "You are unauthorized. Please login to access this page.";
  }

  useEffect(() => {
    console.error(`${errorCode} Error: ${errorMessage} on route:`, location.pathname);
  }, [location.pathname, errorCode, errorMessage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="text-center max-w-md">
        <div className="mb-4 inline-block">
          <img src="/pics/logo.png" alt="logo" className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-4">{errorCode}</h1>
        <p className="text-xs text-gray-400 mb-8">{errorMessage}</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-white text-black text-xs px-6 py-3 rounded-lg font-medium transition-all hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Gallery</span>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
