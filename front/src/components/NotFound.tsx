
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="text-center max-w-md">
        <div className="mb-4 inline-block">
          <img src="/pics/logo.png" alt="logo" className=" w-12 h-12 " />
        </div>
        <h1 className="text-3xl font-bold mb-4">404</h1>
        <p className="text-xs text-gray-400 mb-8">Not Found</p>
        <Link 
          to="/index" 
          className="inline-flex items-center space-x-2 bg-white text-black text-xs px-6 py-3 rounded-lg font-medium transition-all hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Gallery</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
