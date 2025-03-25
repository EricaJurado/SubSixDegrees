import { Devvit, RedditAPIClient, useWebView } from '@devvit/public-api';
import { DEVVIT_SETTINGS_KEYS } from './constants.js';
import { BlocksToWebviewMessage, RedditPost, WebviewToBlockMessage } from '../game/shared.js';
import { Preview } from './components/Preview.js';
import { RedditService } from '../server/RedditService.js';
import { timeAgo } from './utils.js';

// Get current username, defaulting to 'anon' if none found
const getCurrentUsername = async (context: any) => {
  return (await context.reddit.getCurrentUsername()) ?? 'anon';
};

// Get the stored subreddit graph from Redis
const getSubredditGraph = async (context: any, postId: string, username: string) => {
  const redisKey = `subredditGraph_${postId}_${username}`;
  const graphData = await context.redis.get(redisKey);
  return graphData ? JSON.parse(graphData) : {}; // Default to empty if no data exists
};

// Update the graph with a new subreddit connection
const addSubredditConnection = async (
  context: any,
  postId: string,
  username: string,
  fromSubreddit: string,
  toSubreddit: string
) => {
  const redisKey = `subredditGraph_${postId}_${username}`;
  let graph = await getSubredditGraph(context, postId, username);

  // If the subreddit doesn't exist in the graph, add it
  if (!graph[fromSubreddit]) graph[fromSubreddit] = [];
  if (!graph[toSubreddit]) graph[toSubreddit] = [];

  // Avoid duplicate connections between subreddits
  if (!graph[fromSubreddit].includes(toSubreddit)) {
    graph[fromSubreddit].push(toSubreddit);
  }
  if (!graph[toSubreddit].includes(fromSubreddit)) {
    graph[toSubreddit].push(fromSubreddit);
  }

  // Save the updated graph in Redis
  await context.redis.set(redisKey, JSON.stringify(graph));
};

// Register Devvit settings
Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
  realtime: true,
});

// Add a menu item for creating a post
Devvit.addMenuItem({
  label: 'Make my experience post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    const post = await reddit.submitPost({
      title: 'My first experience post',
      subredditName: subreddit.name,
      preview: <Preview />,
    });

    ui.showToast({ text: 'Created post!' });
    ui.navigateTo(post.url);
  },
});

// Add a post type definition for the game
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    // Use the useWebView hook to manage message sending
    const redditAPI = new RedditService(context);
    const { postMessage, mount } = useWebView<WebviewToBlockMessage, BlocksToWebviewMessage>({
      onMessage: async (event, { postMessage }) => {
        console.log('Received message', event);
        const data = event as unknown as WebviewToBlockMessage;

        const username = await getCurrentUsername(context);
        let subredditPath = await getSubredditGraph(context, context.postId!, username);

        switch (data.type) {
          case 'INIT':
            // Send initial data to the webview
            postMessage({
              type: 'INIT_RESPONSE',
              payload: {
                postId: context.postId!,
                subredditPath: subredditPath,
              },
            });
            break;

          case 'GET_SUBREDDIT_FEED':
            const test = await redditAPI.getTopPosts(data.payload.subredditName);
            console.log(test[0]);
            const formattedPosts: RedditPost[] = test.map((post) => ({
              postId: post.id,
              title: post.title,
              authorName: post.authorName,
              body: post.body,
              bodyHtml: post.bodyHtml,
              createdAt: timeAgo(post.createdAt),
              nsfw: post.nsfw,
              score: post.score,
              numberOfComments: post.numberOfComments,
              thumbnail: post.thumbnail,
              secureMedia: post.secureMedia,
            }));

            postMessage({
              type: 'SUBREDDIT_FEED',
              payload: {
                posts: formattedPosts,
              },
            });
            break;

          case 'GET_POST_COMMENTS':
            const comments = await redditAPI.getPostComments(data.payload.postId);
            const formattedComments = comments.map((comment) => ({
              postId: comment.id,
              body: comment.body,
              authorId: comment.authorId,
              authorName: comment.authorName,
              snoovatarURL: comment.snoovatarURL,
            }));
            console.log(formattedComments);
            postMessage({
              type: 'POST_COMMENTS',
              payload: {
                comments: formattedComments,
              },
            });
            break;

          case 'GET_USER_BY_USERNAME':
            const user = await redditAPI.getUserByUsername(data.payload.username);
            postMessage({
              type: 'USER_BY_USERNAME',
              payload: {
                user: user,
              },
            });
            break;

          default:
            console.error('Unknown message type');
            break;
        }
      },
    });

    return (
      <vstack height="100%" width="100%" alignment="center middle">
        <button onPress={() => mount()}>Launch WebView</button>
      </vstack>
    );
  },
});

export default Devvit;
