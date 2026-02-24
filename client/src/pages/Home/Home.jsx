import React from "react";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import MainTweet from "../../components/MainTweet/MainTweet";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import Signin from "../Signin/Signin";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar/Navbar";

const Home = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <>
      {!currentUser ? (
        <Signin />
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-4 mt-20 pb-16 md:pb-0">
          <div className="px-6 hidden md:block">
            <LeftSidebar />
          </div>
          <div className="col-span-2 border-x-2 border-t-slate-800 px-6">
            <MainTweet />
          </div>
          <div className="mb-10">
            <RightSidebar />
          </div>
        </div>
        </>
      )}
    </>
  );
};

export default Home;
