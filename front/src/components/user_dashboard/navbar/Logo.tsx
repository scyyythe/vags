import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/explore" className="flex">
      <img src="/pics/Wx.png" alt="logo" className=" w-11 h-[30px] " />
    </Link>
  );
};

export default Logo;