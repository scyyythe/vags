import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/explore" className="flex">
      <img src="/pics/Wx.png" alt="logo" className=" w-10 h-7 " />
    </Link>
  );
};

export default Logo;