import React from "react";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import TagIcon from "@mui/icons-material/Tag";
import PersonIcon from "@mui/icons-material/Person";
import { useSelector } from "react-redux";

const MobileNav = () => {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
      <Link to="/">
        <div className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/" ? "text-blue-500" : "text-gray-500"}`}>
          <HomeIcon />
          <span className="text-xs">Home</span>
        </div>
      </Link>
      <Link to="/explore">
        <div className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/explore" ? "text-blue-500" : "text-gray-500"}`}>
          <TagIcon />
          <span className="text-xs">Explore</span>
        </div>
      </Link>
      <Link to={`/profile/${currentUser?._id}`}>
        <div className={`flex flex-col items-center p-2 rounded-lg ${location.pathname.includes("/profile") ? "text-blue-500" : "text-gray-500"}`}>
          <PersonIcon />
          <span className="text-xs">Profile</span>
        </div>
      </Link>
    </div>
  );
};

export default MobileNav;