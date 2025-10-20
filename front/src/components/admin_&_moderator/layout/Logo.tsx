import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/explore" className="flex items-center">
      <img
        src="/pics/wx.png"
        alt="logo"
        width={40}
        height={28}
        className="w-10 h-7 object-contain flex-shrink-0"
        draggable={false}
      />
    </Link>
  );
};

export default Logo;
