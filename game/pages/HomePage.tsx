import { useEffect, useState } from 'react';
import HorizontalTree from '../graphs/HorizontalTree';
import { sendToDevvit } from '../utils';
import { RedditPost, SubredditNode } from '../shared';
import { useDevvitListener } from '../hooks/useDevvitListener';
import SubredditFeed from '../components/SubredditFeed';
import RedditUserFeed from '../components/UserFeed';

export const HomePage = ({ postId }: { postId: string }) => {
  const [subredditPath, setSubredditPath] = useState<SubredditNode>({
    name: 'start',
    children: [],
  });

  const [currentSubredditNode, setCurrentSubredditNode] = useState<SubredditNode | null>(null);

  const handleDiscoverSubreddit = (subreddit: string) => {
    sendToDevvit({
      type: 'DISCOVER_SUBREDDIT',
      payload: { subreddit, previousSubreddit: currentSubredditNode?.name || 'start' },
    });

    setSubredditPath((prev: SubredditNode) => {
      const updatedPath = { ...prev };
      let currentNode = currentSubredditNode || updatedPath;

      // traverse and add the new subreddit as child to the curr node
      const existingNode = currentNode.children.find(
        (child: SubredditNode) => child.name === subreddit
      );

      if (!existingNode) {
        const newSubredditNode: SubredditNode = { name: subreddit, children: [] };
        currentNode.children.push(newSubredditNode);
        currentNode = newSubredditNode; // move to newly added node
      } else {
        currentNode = existingNode; // move to existing node
      }

      setCurrentSubredditNode(currentNode); // update curr node
      getSubredditFeed(subreddit);

      return updatedPath;
    });
  };

  const getSubredditFeed = async (subreddit: string) => {
    sendToDevvit({
      type: 'GET_SUBREDDIT_FEED',
      payload: {
        subredditName: subreddit,
      },
    });
  };

  const getPostComments = async (postId: string) => {
    sendToDevvit({
      type: 'GET_POST_COMMENTS',
      payload: {
        postId,
      },
    });
  };

  const getUserByUsername = async (username: string) => {
    sendToDevvit({
      type: 'GET_USER_BY_USERNAME',
      payload: {
        username,
      },
    });
  };

  const subredditfeed = useDevvitListener('SUBREDDIT_FEED');
  const [subredditPosts, setSubredditPosts] = useState<RedditPost[]>([]);

  const [comments, setComments] = useState<any[]>([]);
  const commentsData = useDevvitListener('POST_COMMENTS');

  // useEffect(() => {
  //   getSubredditFeed('javascript');
  // }, [currentSubredditNode]);

  useEffect(() => {
    console.log(subredditPath);
  }, [subredditPath]);

  useEffect(() => {
    console.log(subredditfeed);
    if (subredditfeed) {
      setSubredditPosts(subredditfeed.posts);
      console.log(subredditfeed.posts);
      // getPostComments(subredditfeed.posts[0].postId);
    }
  }, [subredditfeed]);

  useEffect(() => {
    console.log(commentsData);
    if (commentsData) {
      setComments(commentsData.comments);
    }
  }, [commentsData]);

  const [currUser, setCurrUser] = useState<string | null>(null);
  const userByUsername = useDevvitListener('USER_BY_USERNAME');
  const [currUserObject, setCurrUserObject] = useState<any | null>(null);

  const handleItemClick = (type: 'subreddit' | 'user', name: string) => {
    if (type === 'subreddit') {
      handleDiscoverSubreddit(name);
      getSubredditFeed(name);
    } else if (type === 'user') {
      console.log(`Fetching posts for user: ${name}`);
      setCurrUser(name);
      getUserByUsername(name);
      // You can implement a function to fetch user posts here.
    }
  };

  useEffect(() => {
    if (userByUsername) {
      console.log(userByUsername);
      setCurrUserObject(userByUsername.user);
    }
  }, [userByUsername]);

  return (
    <div>
      <p>PostId: {postId}</p>

      <button onClick={() => handleDiscoverSubreddit('javascript')}>Go to r/javascript</button>
      <button onClick={() => handleDiscoverSubreddit('reactjs')}>Go to r/reactjs</button>
      <button onClick={() => handleDiscoverSubreddit('frontend')}>Go to r/frontend</button>

      {subredditPosts && (
        <SubredditFeed
          subreddit="javascript"
          feedData={subredditPosts}
          onItemClick={handleItemClick}
        />
      )}

      {currUserObject && (
        <RedditUserFeed
          redditUser={{
            username: currUserObject.username,
            id: currUserObject.id,
            snoovatarUrl: currUserObject.snoovatarUrl,
            isAdmin: currUserObject.isAdmin,
            nsfw: currUserObject.nsfw,
          }}
        />
      )}
      <HorizontalTree data={subredditPath} />
    </div>
  );
};
