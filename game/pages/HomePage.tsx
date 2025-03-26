import { useEffect, useState } from 'react';
import HorizontalTree from '../graphs/HorizontalTree';
import { sendToDevvit } from '../utils';
import { RedditPost, Node, Subreddit } from '../shared';
import { useDevvitListener } from '../hooks/useDevvitListener';
import RedditUserFeed from '../components/UserFeed';
import SubredditFeed from '../pages/SubredditFeed';
import Post from '../components/Post';

export const HomePage = ({ postId }: { postId: string }) => {
  const [subredditPath, setSubredditPath] = useState<Node>({
    name: 'start',
    type: 'subreddit',
    id: 't2_example',
    children: [],
    isLeafDuplicate: false, // if new node is a duplicate of an existing node, still add as leaf but don't add children to it
  });
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
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

  const getSubredditFeed = (subreddit: string) =>
    sendRequest({ type: 'GET_SUBREDDIT_FEED', payload: { subredditName: subreddit } });

  const getPostComments = (postId: string) =>
    sendRequest({ type: 'GET_POST_COMMENTS', payload: { postId } });

  const getUserByUsername = (username: string) =>
    sendRequest({ type: 'GET_USER_BY_USERNAME', payload: { username } });

  const findNode = (node: Node, name: string, type: string): Node | null => {
    if (node.name === name && node.type === type) return node;
    for (const child of node.children) {
      const found = findNode(child, name, type);
      if (found) return found;
    }
    return null;
  };

  const insertNode = (root: Node, parent: Node, newNode: Node): Node => {
    const existingNode = findNode(root, newNode.name, newNode.type);
    if (existingNode) {
      parent.children.push({ ...newNode, isLeafDuplicate: true, children: [] });
      return existingNode;
    } else {
      parent.children.push(newNode);
      return newNode;
    }
  };

  const handleItemClick = (type: 'subreddit' | 'user' | 'post', name: string, id: string) => {
    let parentNode = currentNode || subredditPath;

    if (type === 'subreddit') {
      sendRequest({
        type: 'DISCOVER_SUBREDDIT',
        payload: { subreddit: name, previousSubreddit: parentNode.name },
      });
    }

    const newNode: Node = { name, type, id, children: [] };

    setSubredditPath((prev) => {
      const updatedTree = { ...prev };
      const selectedNode = insertNode(updatedTree, parentNode, newNode);
      setCurrentNode(selectedNode);
      return updatedTree;
    });

    setCurrentSubredditNode(newNode);

    if (type === 'subreddit') {
      getSubredditFeed(name);
      setView('subreddit');
    } else if (type === 'user') {
      setCurrUser(name);
      getUserByUsername(name);
      setView('user');
    } else if (type === 'post') {
      setCurrentPost(subredditPosts.find((p) => p.postId === name) || null);
      getPostComments(name);
      setView('post');
    }
  };

  useEffect(() => {
    if (subredditFeedData) setSubredditPosts(subredditFeedData.posts || []);
  }, [subredditFeedData]);

  useEffect(() => {
    if (commentsData) setComments(commentsData.comments || []);
  }, [commentsData]);

  useEffect(() => {
    if (userByUsername) setCurrUserObject(userByUsername.user || null);
  }, [userByUsername]);

  useEffect(() => {
    console.log('view:', view);
  }, [view]);

  useEffect(() => {
    console.log('subredditPath:', subredditPath);
  }, [subredditPath]);

  return (
    <div>
      <p>PostId: {postId}</p>
      <button onClick={() => handleItemClick('subreddit', 'javascript', 'test')}>
        Go to r/javascript
      </button>
      <button onClick={() => handleItemClick('subreddit', 'reactjs', 'test1')}>
        Go to r/reactjs
      </button>
      <button onClick={() => handleItemClick('subreddit', 'frontend', 'test2')}>
        Go to r/frontend
      </button>
      <button onClick={() => handleItemClick('subreddit', 'webdev', 'test3')}>
        Go to r/webdev
      </button>

      {view === 'subreddit' && subredditFeedData && (
        <SubredditFeed
          subredditName={subredditFeedData.subreddit.name || ''}
          subreddit={subredditFeedData.subreddit || {}}
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
        <Post post={currentPost} comments={comments} onItemClick={handleItemClick} />
      )}

      <HorizontalTree data={subredditPath} />
    </div>
  );
};
