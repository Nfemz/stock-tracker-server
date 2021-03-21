const axios = require("axios");
const _ = require("underscore");
const BASE_URL = "https://www.reddit.com/";
const GME_SUBREDDIT = "r/GME.json";
const parser = new DOMParser();

/**
 *
 * @param url thread url to fetch updates from
 * @returns formatted and stringified HTML || undefined
 */
export const getFormattedSubredditPostByUrl = async (url: string) => {
  const unformattedHtml = await getPostHtmlByUrl(url);

  if (unformattedHtml) {
    const formattedHtml = _.unescape(unformattedHtml);
    const cleanedUpHtml = cleanUpHTML(formattedHtml);

    return cleanedUpHtml;
  }

  return undefined;
};

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
 * @description parses through raw HTML response and adds classes + removes unneccessary elements
 * @param html unformatted stringified HTML
 * @returns formatted stringified HTML
 */
const cleanUpHTML = (html: any) => {
  const doc = parser.parseFromString(html, "text/html");

  const redditPostWrapper = doc.getElementsByClassName("md");
  redditPostWrapper[0].className = "reddit-post-content";

  const paragraphs = doc.querySelectorAll("p");
  paragraphs.forEach((paragraph) => {
    paragraph.className += "reddit-post-paragraph";
  });

  const anchors = doc.querySelectorAll("a");
  anchors.forEach((anchor) => {
    if (anchor.innerText.startsWith("https://preview.redd.it/")) {
      anchor.innerHTML = `<img class='post-image' alt=${anchor.innerText} src=${anchor.innerText}></img>`;
    }
  });

  const pres = doc.querySelectorAll("pre");
  pres.forEach((pre) => {
    const childElement = pre.children[0];
    const childElementWrapper = document.createElement("div");
    childElementWrapper.className += "reddit-post-code-wrapper";
    childElementWrapper.appendChild(childElement);

    const parentElement = pre.parentElement;
    const nextSibling = pre.nextSibling;
    parentElement &&
      nextSibling &&
      parentElement.insertBefore(childElementWrapper, nextSibling);
  });

  const codes = doc.querySelectorAll("code");
  codes.forEach((code) => {
    code.className += "reddit-post-code";
  });

  const newDoc = "<html>" + doc.documentElement.innerHTML + "</html>";
  return newDoc;
};

/**
 *
 * @param url url of reddit post to subscribe to
 * @param ws websocket connection to dump data into
 */
export function subscribeSubredditPost(url: string, ws: WebSocket) {
  getFormattedSubredditPostByUrl(url)
    .then((res) => {
      res && ws.send(res);
    })
    .finally(() => subscribeSubredditPost(url, ws));
}
