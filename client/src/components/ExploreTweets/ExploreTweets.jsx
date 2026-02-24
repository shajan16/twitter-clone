import React, { useEffect, useState, useRef } from "react";

import axios from "axios";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Tweet from "../Tweet/Tweet";
import { monitorTweets } from "../../utils/notifications";

const ExploreTweets = () => {
  const [explore, setExplore] = useState(null);
  const [filteredTweets, setFilteredTweets] = useState(null);
  const previousTweetsRef = useRef([]);
  const { currentUser } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const exploreTweets = await axios.get("/tweets/explore");
        const newTweets = exploreTweets.data;
        

        // Monitor tweets for notifications
        if (currentUser?.notificationsEnabled) {
          await monitorTweets(
            newTweets,
            previousTweetsRef.current,
            currentUser.notificationsEnabled
          );
        }

        // Update previous tweets reference
        previousTweetsRef.current = newTweets;
        setExplore(newTweets);
      } catch (err) {
        console.log("error", err);
      }
    };
    fetchData();


    let intervalId;
    if (currentUser?.notificationsEnabled) {
      intervalId = setInterval(fetchData, 30000); 
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentUser._id, currentUser?.notificationsEnabled]);

  useEffect(() => {
    if (explore && searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = explore.filter((tweet) => {
        return tweet.description?.toLowerCase().includes(query);
      });
      setFilteredTweets(filtered);
    } else {
      setFilteredTweets(null);
    }
  }, [searchQuery, explore]);

  const tweetsToDisplay = filteredTweets !== null ? filteredTweets : explore;

  return (
    <div className="mt-6 space-y-4">
      {searchQuery && (
        <div className="mb-4 px-2">
          <p className="text-gray-600">
            Search results for: <span className="font-semibold">"{searchQuery}"</span>
            {filteredTweets !== null && (
              <span className="ml-2 text-sm">
                ({filteredTweets.length} {filteredTweets.length === 1 ? "tweet" : "tweets"})
              </span>
            )}
          </p>
        </div>
      )}
      {tweetsToDisplay && tweetsToDisplay.length > 0 ? (
        tweetsToDisplay.map((tweet) => {
          return (
            <Tweet key={tweet._id} tweet={tweet} setData={setExplore} />
          );
        })
      ) : searchQuery ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tweets found matching "{searchQuery}"</p>
        </div>
      ) : null}
    </div>
  );
};

export default ExploreTweets;
