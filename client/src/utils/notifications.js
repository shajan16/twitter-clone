

// Keywords to monitor
const KEYWORDS = ['cricket', 'science'];

/**
 * Request notification permission from the browser
 * @returns {Promise<boolean>} True if permission granted, false otherwise
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Check if a tweet contains any of the monitored keywords
 * @param {string} tweetText - The tweet description/text
 * @returns {boolean} True if tweet contains keywords
 */
export const containsKeywords = (tweetText) => {
  if (!tweetText) return false;
  const lowerText = tweetText.toLowerCase();
  return KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

/**
 * Show a browser notification for a tweet
 * @param {Object} tweet - The tweet object
 * @param {string} tweet.description - The tweet content
 * @param {string} tweet.userId - The user ID who posted the tweet
 */
export const showTweetNotification = (tweet) => {
  if (!tweet || !tweet.description) return;

  const options = {
    body: tweet.description,
    icon: '/twitter-logo.png',
    badge: '/twitter-logo.png',
    tag: `tweet-${tweet._id}`, // Prevent duplicate notifications
    requireInteraction: false,
  };

  try {
    new Notification('New Tweet Alert', options);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

/**
 * Check and notify if tweet contains keywords
 * @param {Object} tweet - The tweet object
 * @param {boolean} notificationsEnabled - User's notification preference
 * @returns {Promise<boolean>} True if notification was shown
 */
export const checkAndNotify = async (tweet, notificationsEnabled) => {
  if (!notificationsEnabled) {
    return false;
  }

  if (!containsKeywords(tweet.description)) {
    return false;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  showTweetNotification(tweet);
  return true;
};

/**
 * Monitor an array of tweets and notify for new ones containing keywords
 * @param {Array} newTweets - Array of new tweets
 * @param {Array} previousTweets - Array of previously seen tweets (optional)
 * @param {boolean} notificationsEnabled - User's notification preference
 * @returns {Promise<void>}
 */
export const monitorTweets = async (newTweets, previousTweets = [], notificationsEnabled) => {
  if (!notificationsEnabled || !newTweets || newTweets.length === 0) {
    return;
  }

  // Get IDs of previously seen tweets
  const previousIds = new Set(previousTweets.map(t => t._id));

  // Filter for new tweets only
  const unseenTweets = newTweets.filter(tweet => !previousIds.has(tweet._id));

  // Check each new tweet
  for (const tweet of unseenTweets) {
    await checkAndNotify(tweet, notificationsEnabled);
  }
};

