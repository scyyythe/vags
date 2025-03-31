import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/explore" className="flex">
      <img src="/pics/logo.png" alt="logo" className=" w-10 h-10 " />
    </Link>
  );
};

export default Logo;