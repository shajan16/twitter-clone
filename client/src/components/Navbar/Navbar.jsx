import React, { useState } from "react";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import SearchIcon from "@mui/icons-material/Search";

import { useLocation, useNavigate } from "react-router-dom";
import UserPlaceholder from "../UserPlaceholder/UserPlaceholder";

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation().pathname;
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-10 bg-white">
    <div className="grid grid-cols-1 md:grid-cols-4 my-5 justify-center">
      <div className="mx-auto md:mx-0">
        <img
          src="/twitter-logo.png"
          alt="Twitter Logo"
          width={40}
          className="ml-8"
        />
      </div>

      <div className="col-span-2 md:border-x-2 md:border-slate-200 md:px-6 my-6 md:my-0 hidden md:block">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-2xl">
            {location.includes("profile") ? (
              <UserPlaceholder setUserData={setUserData} userData={userData} />
            ) : location.includes("explore") ? (
              "Explore"
            ) : (
              "Home"
            )}
          </h2>
          <StarBorderPurple500Icon />
        </div>
      </div>

      <div className="px-0 md:px-6 mx-auto relative hidden md:block">
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search Twitter"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-blue-100 rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>
    </div>
    </div>
  );
};

export default Navbar;
