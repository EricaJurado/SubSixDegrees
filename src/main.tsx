import { Devvit, useWebView } from '@devvit/public-api';
import { DEVVIT_SETTINGS_KEYS } from './constants.js';
import { BlocksToWebviewMessage, WebviewToBlockMessage } from '../game/shared.js';
import { Preview } from './components/Preview.js';

const getCurrentUsername = async (context: any) => {
  console.log('Getting current username');
  return (await context.reddit.getCurrentUsername()) ?? 'anon';
};

// Fetch path from Redis
const getSubredditPathFromRedis = async (context: any, username: string) => {
  const subredditPath = await context.redis.get(`subredditPath_${username}`);
  console.log('Subreddit path:', subredditPath);
  return subredditPath ? JSON.parse(subredditPath) : [];
};

// Add the new subreddit to the user's path
const setSubredditPathInRedis = async (context: any, username: string, newSubreddit: string) => {
  const subredditPath = await getSubredditPathFromRedis(context, username);
  console.log('Current subreddit path:', subredditPath);
  subredditPath.push(newSubreddit);
  await context.redis.set(`subredditPath_${username}`, JSON.stringify(subredditPath)); // Save the new path
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
    const { mount } = useWebView<WebviewToBlockMessage, BlocksToWebviewMessage>({
      onMessage: async (event, { postMessage }) => {
        console.log('Received message', event);
        const data = event as unknown as WebviewToBlockMessage;

        const username = await getCurrentUsername(context);
        let subredditPath = await getSubredditPathFromRedis(context, username);

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
            const newSubreddit = data.payload.subreddit;
            await setSubredditPathInRedis(context, username, newSubreddit);
            subredditPath = await getSubredditPathFromRedis(context, username); // Update the path

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
        <button
          onPress={() => {
            mount();
          }}
        >
          Launch
        </button>
      </vstack>
    );
  },
});

export default Devvit;
