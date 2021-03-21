const axios = require("axios");
const _ = require("underscore");
const BASE_URL = "https://www.reddit.com/";
const GME_SUBREDDIT = "r/GME.json";

/**
 *
 * @param url thread url to fetch updates from
 * @returns stringified + unformatted HTML
 */
const getPostHtmlByUrl = async (url: string) => {
  if (url) {
    const posts = await fetchSubredditPosts();
    let foundPost: any = undefined;
    posts &&
      posts.forEach((post: any) => {
        if (post.data.url === url) {
          foundPost = post;
        }
      });
    return foundPost ? foundPost.data.selftext_html : foundPost;
  }
};

/**
 *
 * @returns an array of res data of the top 20 posts of a subreddit
 */
const fetchSubredditPosts = async () => {
  try {
    const res = await axios(`${BASE_URL}${GME_SUBREDDIT}`);
    return res.data.data.children;
  } catch (e) {
    console.error(e);
  }
};

/**
 *
 * @param url url of reddit post to subscribe to
 * @param ws websocket connection to dump data into
 */
export function subscribeSubredditPost(url: string, ws: WebSocket) {
  getPostHtmlByUrl(url)
    .then((res) => {
      res && ws.send(res);
    })
    .finally(() => subscribeSubredditPost(url, ws));
}
