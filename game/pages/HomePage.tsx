import { useEffect, useState } from 'react';
import HorizontalTree from '../graphs/HorizontalTree';
import { sendToDevvit } from '../utils';
import { RedditPost, Node } from '../shared';
import { useDevvitListener } from '../hooks/useDevvitListener';
import RedditUserFeed from '../components/UserFeed';
import SubredditFeed from '../pages/SubredditFeed';

export const HomePage = ({ postId }: { postId: string }) => {
  const [subredditPath, setSubredditPath] = useState<Node>({
    name: 'start',
    type: 'subreddit',
    id: 't2_example',
    children: [],
  });
  const [currentSubredditNode, setCurrentSubredditNode] = useState<Node | null>(null);
  const [subredditPosts, setSubredditPosts] = useState<RedditPost[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [currUser, setCurrUser] = useState<string | null>(null);
  const [currUserObject, setCurrUserObject] = useState<any | null>(null);
  const [currentPost, setCurrentPost] = useState<RedditPost | null>(null);
  const [view, setView] = useState<'subreddit' | 'post' | 'user'>('subreddit');

  const subredditFeedData = useDevvitListener('SUBREDDIT_FEED');
  const commentsData = useDevvitListener('POST_COMMENTS');
  const userByUsername = useDevvitListener('USER_BY_USERNAME');

  const sendRequest = (message: {
    type:
      | 'GET_SUBREDDIT_FEED'
      | 'GET_POST_COMMENTS'
      | 'GET_USER_BY_USERNAME'
      | 'DISCOVER_SUBREDDIT';
    payload: any;
  }) => {
    sendToDevvit(message);
  };

  const handleDiscoverSubreddit = (subreddit: string, id: string) => {
    sendRequest({
      type: 'DISCOVER_SUBREDDIT',
      payload: { subreddit, previousSubreddit: currentSubredditNode?.name || 'start' },
    });

    setSubredditPath((prev: Node) => {
      const updatedPath = { ...prev };
      let currentNode = currentSubredditNode || updatedPath;
      const existingNode = currentNode.children.find((child: Node) => child.name === subreddit);

      if (!existingNode) {
        const newSubredditNode: Node = { name: subreddit, type: 'subreddit', id: id, children: [] };
        currentNode.children.push(newSubredditNode);
        currentNode = newSubredditNode; // move to newly added node
      } else {
        currentNode = existingNode;
      }

      setCurrentSubredditNode(currentNode);
      getSubredditFeed(subreddit);
      console.log(updatedPath);
      return updatedPath;
    });
  };

  const getSubredditFeed = (subreddit: string) =>
    sendRequest({ type: 'GET_SUBREDDIT_FEED', payload: { subredditName: subreddit } });
  const getPostComments = (postId: string) =>
    sendRequest({ type: 'GET_POST_COMMENTS', payload: { postId } });
  const getUserByUsername = (username: string) =>
    sendRequest({ type: 'GET_USER_BY_USERNAME', payload: { username } });

  useEffect(() => {
    if (subredditFeedData) setSubredditPosts(subredditFeedData.posts || []);
  }, [subredditFeedData]);

  useEffect(() => {
    if (commentsData) setComments(commentsData.comments || []);
  }, [commentsData]);

  useEffect(() => {
    if (userByUsername) setCurrUserObject(userByUsername.user || null);
  }, [userByUsername]);

  const handleItemClick = (type: 'subreddit' | 'user' | 'post', name: string, id: string) => {
    if (type === 'subreddit') {
      handleDiscoverSubreddit(name, id);
      setView('subreddit');
    } else if (type === 'user') {
      setCurrUser(name);
      getUserByUsername(name);
      setView('user');
    } else if (type === 'post') {
      const post = subredditPosts.find((p) => p.postId === name) || null;
      setCurrentPost(post);
      getPostComments(name);
      setView('post');
    }
  };

  return (
    <div>
      <p>PostId: {postId}</p>
      <button onClick={() => handleDiscoverSubreddit('javascript', 'test')}>
        Go to r/javascript
      </button>
      <button onClick={() => handleDiscoverSubreddit('reactjs', 'test1')}>Go to r/reactjs</button>
      <button onClick={() => handleDiscoverSubreddit('frontend', 'test2')}>Go to r/frontend</button>

      {view === 'subreddit' && (
        <SubredditFeed
          subreddit={currentSubredditNode?.name || 'start'}
          feedData={subredditPosts}
          onItemClick={handleItemClick}
        />
      )}

      {view === 'user' && currUserObject && (
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

      {view === 'post' && currentPost && (
        <div>
          <h2>{currentPost.title}</h2>
          <p>By {currentPost.authorName}</p>
          <p>{currentPost.body}</p>
          <h3>Comments</h3>
          <ul>
            {comments.map((comment) => (
              <li key={comment.postId}>
                <strong>{comment.authorName}</strong>: {comment.body}
              </li>
            ))}
          </ul>
        </div>
      )}

      <HorizontalTree data={subredditPath} />
    </div>
  );
};
