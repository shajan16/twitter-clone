import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import { useSelector } from "react-redux";
import Tweet from "../Tweet/Tweet";
import { monitorTweets } from "../../utils/notifications";

const TimelineTweet = () => {
  const [timeLine, setTimeLine] = useState(null);
  const previousTweetsRef = useRef([]);

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timelineTweets = await axios.get(
          `/tweets/timeline/${currentUser._id}`
        );

        const newTweets = timelineTweets.data;
        
        if (currentUser?.notificationsEnabled) {
          await monitorTweets(
            newTweets,
            previousTweetsRef.current,
            currentUser.notificationsEnabled
          );
        }

        
        previousTweetsRef.current = newTweets;
        setTimeLine(newTweets);
      } catch (err) {
        console.log("error", err);
      }
    };

    fetchData();

    
    let intervalId;
    if (currentUser?.notificationsEnabled) {
      intervalId = setInterval(fetchData, 30000); // 30 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentUser._id, currentUser?.notificationsEnabled]);

  console.log("Timeline", timeLine);
  return (
    <div className="mt-6 space-y-4">
      {timeLine &&
        timeLine.map((tweet) => {
          return (
            <Tweet key={tweet._id} tweet={tweet} setData={setTimeLine} />
          );
        })}
    </div>
  );
};

export default TimelineTweet;
