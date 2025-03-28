import { Devvit, useWebView } from '@devvit/public-api';
import { BlocksToWebviewMessage, RedditPost, WebviewToBlockMessage } from '../game/shared.js';
import { Preview } from './components/Preview.js';
import { RedditService } from '../server/RedditService.js';
import { timeAgo } from './utils.js';

// Get current username, defaulting to 'anon' if none found
const getCurrentUsername = async (context: any) => {
  return (await context.reddit.getCurrentUsername()) ?? 'anon';
};

// Register Devvit settings
Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
  realtime: true,
  media: true,
});

Devvit.addSchedulerJob({
  name: 'daily-thread',
  onRun: async (job, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();
    const today = new Date().toLocaleString('us-en');
    const resp = await context.reddit.submitPost({
      subredditName: subreddit.name,
      title: `Daily Challenge ${today}`,
      text: 'Solve the daily challenge!',
    });
  },
});

// Devvit.addTrigger({
//   event: 'AppInstall',
//   onEvent: async (_, context) => {
//     try {
//       const jobId = await context.scheduler.runJob({
//         cron: '0 7 * * *', // Run daily at 12:00 UTC
//         name: 'daily-thread',
//         data: {},
//       });
//       await context.redis.set('jobId', jobId);
//     } catch (e) {
//       console.log('error was not able to schedule:', e);
//       throw e;
//     }
//   },
// });

// Add a menu item for creating a post
Devvit.addMenuItem({
  label: 'Make my experience post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    const post = await reddit.submitPost({
      title: 'SubSixDegrees',
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
        // let subredditPath = await getSubredditGraph(context, context.postId!, username);

        const getSubredditInfo = async (subredditName: string) => {
          let posts = [];
          let subreddit = null;
          try {
            posts = await redditAPI.getNewPosts(subredditName);
            console.log('here?');
            subreddit = await redditAPI.getSubredditDetails(subredditName);
          } catch (error) {
            console.error(`Error fetching subreddit info: ${error}`);
          }

          console.log('Past to here');
          if (!subreddit) {
            console.log('error?');
            postMessage({
              type: 'SUBREDDIT_FEED',
              payload: {
                posts: [],
                subreddit: {
                  name: subredditName,
                  id: subredditName,
                },
                error: true,
              },
            });
            return;
          }

          let subredditStyles = {
            bannerImage: '',
            icon: '',
          };
          try {
            const subredditId = posts[0]?.subredditId;
            if (!subredditId) {
              console.error('No subreddit ID found');
              return;
            }
            subredditStyles = await redditAPI.getSubredditStyles(subredditId);
            console.log(subredditStyles);
          } catch (error) {
            console.error(`Error fetching subreddit styles: ${error}`);
          }

          const formattedPosts: RedditPost[] = posts.map((post) => ({
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
            subreddit: post.subreddit,
          }));

          postMessage({
            type: 'SUBREDDIT_FEED',
            payload: {
              posts: formattedPosts,
              subreddit: {
                name: subreddit.name,
                id: subreddit.id,
                isNsfw: subreddit.isNsfw,
                description: subreddit.description?.markdown,
                subscribersCount: subreddit.subscribersCount,
                styles: subredditStyles,
              },
            },
          });
        };

        switch (data.type) {
          case 'INIT':
            // Send initial data to the webview
            console.log('trying');
            const parentPostInfo = await redditAPI.getPostById(context.postId!);
            console.log(parentPostInfo);

            postMessage({
              type: 'INIT_RESPONSE',
              payload: {
                postId: context.postId!,
                subredditPath: {},
                createdAt: parentPostInfo.createdAt?.toLocaleDateString(),
              },
            });

            // get current user's snoovatar
            const player = await redditAPI.getUserByUsername(username);
            postMessage({
              type: 'PLAYER',
              payload: {
                id: player.id,
                username: player.username,
                snoovatarUrl: player.snoovatarUrl,
              },
            });
            break;

          case 'GET_SUBREDDIT_FEED':
            await getSubredditInfo(data.payload.subredditName);
            break;

          case 'GET_POST':
            const post = await redditAPI.getPostById(data.payload.postId);
            postMessage({
              type: 'POST',
              payload: {
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
                subreddit: post.subredditName,
              },
            });
            break;

          case 'GET_POST_COMMENTS':
            const comments = await redditAPI.getPostComments(data.payload.postId);
            console.log(comments[0]);
            const formattedComments = comments.map((comment) => ({
              id: comment.id,
              postId: comment.postId,
              body: comment.body,
              authorId: comment.authorId,
              authorName: comment.authorName,
              snoovatarURL: comment.snoovatarURL,
            }));
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

          case 'GET_USER_POSTS':
            console.log('GET_USER_POSTS');
            const userPosts = await redditAPI.getUserPostsByName(data.payload.username);
            const formattedUserPosts = userPosts.map((post) => ({
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
              subreddit: post.subredditName,
            }));
            postMessage({
              type: 'USER_POSTS',
              payload: {
                posts: formattedUserPosts,
              },
            });
            break;

          case 'GET_USER_COMMENTS':
            console.log('GET_USER_COMMENTS');
            const userComments = await redditAPI.getUserCommentsByName(data.payload.username);
            const formattedUserComments = userComments.map((comment) => ({
              postId: comment.postId,
              body: comment.body,
              authorId: comment.authorId,
              authorName: comment.authorName,
              snoovatarURL: comment.snoovatarURL,
              subreddit: comment.subredditName,
            }));
            postMessage({
              type: 'USER_COMMENTS',
              payload: {
                comments: formattedUserComments,
              },
            });
            break;

          case 'COMMENT_ON_POST':
            let imageResp = await context.media.upload({
              url: data.payload.base64Image,
              type: 'image',
            });

            const imageMediaId = imageResp.mediaId;

            await redditAPI.commentOnPost(data.payload.postId, data.payload.comment, imageMediaId);
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
