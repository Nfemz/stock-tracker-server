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
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    url += ".json";

    const post = await axios.get(url);
    return post.data[0].data.children[0].data.selftext_html;
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
      if (res && ws.readyState == ws.OPEN) {
        res && ws.send(JSON.stringify([res]));
      }
      return;
    })
    .finally(() => subscribeSubredditPost(url, ws))
    .catch((err) => {
      console.warn(err);
      return;
    });
}
