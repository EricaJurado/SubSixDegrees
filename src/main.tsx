import { Devvit, useWebView } from '@devvit/public-api';
import { DEVVIT_SETTINGS_KEYS } from './constants.js';
import { BlocksToWebviewMessage, WebviewToBlockMessage } from '../game/shared.js';
import { Preview } from './components/Preview.js';

const getCurrentUsername = async (context: any) => {
  return (await context.reddit.getCurrentUsername()) ?? 'anon';
};

// Get Subreddit by name
const getSubredditByName = async (context: any, subredditName: string) => {
  const subreddit = await context.reddit.getSubredditByName(subredditName);
  return {
    id: subreddit.id,
    name: subreddit.name,
    description: subreddit.description,
    subscribers: subreddit.subscribers,
    url: subreddit.url,
    nsfw: subreddit.nsfw,
  };
};

// Get the stored subreddit graph from Redis
const getSubredditGraph = async (context: any, postId: string, username: string) => {
  const redisKey = `subredditGraph_${postId}_${username}`;
  const graphData = await context.redis.get(redisKey);
  return graphData ? JSON.parse(graphData) : {};
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

  if (!graph[fromSubreddit]) graph[fromSubreddit] = [];
  if (!graph[toSubreddit]) graph[toSubreddit] = [];

  // Avoid duplicate connections
  if (!graph[fromSubreddit].includes(toSubreddit)) {
    graph[fromSubreddit].push(toSubreddit);
  }
  if (!graph[toSubreddit].includes(fromSubreddit)) {
    graph[toSubreddit].push(fromSubreddit);
  }

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
    const { postMessage, mount } = useWebView<WebviewToBlockMessage, BlocksToWebviewMessage>({
      onMessage: async (event, { postMessage }) => {
        console.log('Received message', event);
        const data = event as unknown as WebviewToBlockMessage;

        const username = await getCurrentUsername(context);
        let subredditPath = await getSubredditGraph(context, context.postId!, username);

        switch (data.type) {
          case 'INIT':
            postMessage({
              type: 'INIT_RESPONSE',
              payload: {
                postId: context.postId!,
                subredditPath: subredditPath,
              },
            });
            break;

          case 'DISCOVER_SUBREDDIT':
            const { subreddit, previousSubreddit } = data.payload;
            await addSubredditConnection(
              context,
              context.postId!,
              username,
              previousSubreddit,
              subreddit
            );
            subredditPath = await getSubredditGraph(context, context.postId!, username);

            postMessage({
              type: 'UPDATE_SUBREDDIT_PATH',
              payload: {
                subredditPath: subredditPath,
              },
            });
            break;

          default:
            console.error('Unknown message type', data satisfies never);
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
