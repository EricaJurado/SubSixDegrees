import { use, useEffect, useRef, useState } from 'react';
import HorizontalTree from '../graphs/HorizontalTree';
import { sendToDevvit } from '../utils';
import { RedditPost, Node, Subreddit } from '../shared';
import { useDevvitListener } from '../hooks/useDevvitListener';
import RedditUserFeed from '../components/UserFeed';
import SubredditFeed from '../pages/SubredditFeed';
import Post from '../components/Post';
import dailyChallenges from '../dailyChallenges.json';

export const HomePage = ({ postId }: { postId: string }) => {
  // get today's date and get the corresponding dailyChallenge
  const today = new Date().toLocaleDateString();
  const allChallenges = dailyChallenges as Record<string, string[]>;
  const todaysChallenge = allChallenges[today];
  const startSubreddit = todaysChallenge[0];
  const targetSubreddit = todaysChallenge[1];

  const [subredditPath, setSubredditPath] = useState<Node>({
    name: startSubreddit,
    type: 'subreddit',
    id: startSubreddit.toLowerCase(),
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
  const player = useDevvitListener('PLAYER');

  const sendRequest = (message: {
    type:
      | 'GET_SUBREDDIT_FEED'
      | 'GET_POST_COMMENTS'
      | 'GET_USER_BY_USERNAME'
      | 'DISCOVER_SUBREDDIT'
      | 'COMMENT_ON_POST';
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

  useEffect(() => {
    if (subredditFeedData) setSubredditPosts(subredditFeedData.posts || []);
  }, [subredditFeedData]);

  useEffect(() => {
    if (commentsData) setComments(commentsData.comments || []);
  }, [commentsData]);

  useEffect(() => {
    if (userByUsername) setCurrUserObject(userByUsername.user || null);
  }, [userByUsername]);

  const findNode = (node: Node, id: string, type: string): Node | null => {
    if (node.id === id && node.type === type) return node;
    for (const child of node.children) {
      const found = findNode(child, id, type);
      if (found) return found;
    }
    return null;
  };

  const insertNode = (root: Node, parent: Node, newNode: Node): Node => {
    const existingNode = findNode(root, newNode.id.toLowerCase(), newNode.type);
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

    const newNode: Node = { name, type, id: id.toLowerCase(), children: [] };

    setSubredditPath((prev) => {
      const updatedTree = { ...prev };
      const selectedNode = insertNode(updatedTree, parentNode, newNode);
      setCurrentNode(selectedNode);
      return updatedTree;
    });

    setCurrentSubredditNode(newNode);

    teleportToNode(newNode);
  };

  const teleportToNode = (node: Node) => {
    if (node.type === 'subreddit') {
      getSubredditFeed(node.name);
      setView('subreddit');
    } else if (node.type === 'user') {
      setCurrUser(node.name);
      getUserByUsername(node.name);
      setView('user');
    } else if (node.type === 'post') {
      setCurrentPost(subredditPosts.find((p) => p.postId === node.name) || null);
      getPostComments(node.name);
      setView('post');
    }
  };

  const handleNodeClick = (node: Node) => {
    setCurrentNode(node);
    teleportToNode(node);
  };

  useEffect(() => {
    if (currentNode?.id.toString() === targetSubreddit.toLowerCase()) {
      console.log('WIN!!!!');
    }
  }, [currentNode]);

  const ref = useRef<SVGSVGElement | null>(null);

  const [prepImageForComment, setPrepImageForComment] = useState(true);

  const testCommentTrigger = async () => {
    setPrepImageForComment(false);
  };

  useEffect(() => {
    if (!prepImageForComment) {
      convertToPng();
      setPrepImageForComment(false);
    }
  }, [prepImageForComment]);

  const convertToPng = async () => {
    if (!ref.current) return;

    // Get the SVG data
    const svgString = new XMLSerializer().serializeToString(ref.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    // Load into an Image
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = ref.current!.clientWidth;
      canvas.height = ref.current!.clientHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      // setBase64(canvas.toDataURL('image/png')); // Convert to Base64
      const base64OfSVG = canvas.toDataURL('image/png');
      sendRequest({
        type: 'COMMENT_ON_POST',
        payload: { postId: postId, comment: 'This is a test comment', base64Image: base64OfSVG },
      });
      URL.revokeObjectURL(url); // Clean up
    };
    img.src = url;
    return img;
  };

  return (
    <div>
      <button onClick={testCommentTrigger}>Test Comment</button>
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

      <HorizontalTree
        data={subredditPath}
        handleNodeClick={handleNodeClick}
        currentNode={currentNode}
        snoovatarUrl={player?.snoovatarUrl}
        ref={ref}
        prepImageForComment={prepImageForComment}
      />
    </div>
  );
};
