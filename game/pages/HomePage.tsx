import { use, useEffect, useRef, useState } from 'react';
import HorizontalTree from '../graphs/HorizontalTree';
import { sendToDevvit } from '../utils';
import { RedditPost, Node } from '../shared';
import { useDevvitListener } from '../hooks/useDevvitListener';
import RedditUserFeed from '../components/UserFeed';
import SubredditFeed from '../pages/SubredditFeed';
import Post from '../components/Post';
import dailyChallenges from '../dailyChallenges.json';

export const HomePage = ({ postId }: { postId: string }) => {
  // Get today's challenge
  const today = new Date().toLocaleDateString();
  const challenges = dailyChallenges as Record<string, string[]>;
  const [startSubreddit, targetSubreddit] = challenges[today] || [];

  // State management
  const [subredditPath, setSubredditPath] = useState<Node>({
    name: startSubreddit,
    type: 'subreddit',
    id: startSubreddit.toLowerCase(),
    children: [],
    isLeafDuplicate: false,
  });
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [subredditPosts, setSubredditPosts] = useState<RedditPost[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [currUser, setCurrUser] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<RedditPost | null>(null);
  const [prepImageForComment, setPrepImageForComment] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [view, setView] = useState<'subreddit' | 'post' | 'user'>('subreddit');
  const ref = useRef<SVGSVGElement | null>(null);

  // Devvit event listeners
  const subredditFeedData = useDevvitListener('SUBREDDIT_FEED');
  const commentsData = useDevvitListener('POST_COMMENTS');
  const userByUsername = useDevvitListener('USER_BY_USERNAME');
  const player = useDevvitListener('PLAYER');

  // Update states based on Devvit responses
  useEffect(() => {
    if (subredditFeedData) setSubredditPosts(subredditFeedData.posts || []);
  }, [subredditFeedData]);

  useEffect(() => {
    if (commentsData) setComments(commentsData.comments || []);
  }, [commentsData]);

  useEffect(() => {
    if (userByUsername) setCurrUser(userByUsername.user?.username || null);
  }, [userByUsername]);

  // Send request to Devvit
  const sendRequest = (message: {
    type:
      | 'DISCOVER_SUBREDDIT'
      | 'INIT'
      | 'GET_SUBREDDIT_FEED'
      | 'GET_POST_COMMENTS'
      | 'GET_USER_BY_USERNAME'
      | 'COMMENT_ON_POST';
    payload: any;
  }) => {
    sendToDevvit(message);
  };

  // Navigation handling
  const handleItemClick = (type: 'subreddit' | 'user' | 'post', name: string, id: string) => {
    const newNode: Node = { name, type, id: id.toLowerCase(), children: [] };
    setSubredditPath((prev) => {
      const updatedTree = { ...prev, children: [...prev.children, newNode] };
      setCurrentNode(newNode);
      return updatedTree;
    });

    // Handle sending the correct request based on the item type
    if (type === 'subreddit') {
      // Send the "DISCOVER_SUBREDDIT" request with appropriate payload
      sendRequest({
        type: 'DISCOVER_SUBREDDIT',
        payload: { subreddit: name, previousSubreddit: currentNode?.name },
      });
      sendRequest({
        type: 'GET_SUBREDDIT_FEED',
        payload: { subredditName: name },
      });
      setView('subreddit');
    } else if (type === 'user') {
      setCurrUser(name);
      // Send the "GET_USER_BY_USERNAME" request
      sendRequest({
        type: 'GET_USER_BY_USERNAME',
        payload: { username: name },
      });
      setView('user');
    } else if (type === 'post') {
      setCurrentPost(subredditPosts.find((p) => p.postId === name) || null);
      // Send the "GET_POST_COMMENTS" request
      sendRequest({
        type: 'GET_POST_COMMENTS',
        payload: { postId: name },
      });
      setView('post');
    }
  };

  // Check for win condition
  useEffect(() => {
    if (currentNode?.id.toLowerCase() === targetSubreddit.toLowerCase()) {
      console.log('WIN!!!!');
      setHasWon(true);
    }
  }, [currentNode]);

  useEffect(() => {
    console.log(hasWon);
    if (hasWon && prepImageForComment) {
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
            payload: {
              postId: postId,
              comment: 'This is a test comment',
              base64Image: base64OfSVG,
            },
          });
          URL.revokeObjectURL(url); // Clean up
        };
        img.src = url;
        return img;
      };

      convertToPng();
    }
  }, [hasWon, prepImageForComment]);

  return (
    <div>
      {hasWon && <h1>You won!</h1>}
      {hasWon && (
        <button onClick={() => setPrepImageForComment(true)}>Prepare image for comment</button>
      )}
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

      {view === 'user' && currUser && userByUsername && (
        <RedditUserFeed
          redditUser={{
            username: currUser,
            id: userByUsername.user?.id || '',
            snoovatarUrl: userByUsername.user?.snoovatarUrl || '',
            isAdmin: userByUsername.user?.isAdmin || false,
            nsfw: userByUsername.user?.nsfw || false,
          }}
        />
      )}

      {view === 'post' && currentPost && (
        <Post post={currentPost} comments={comments} onItemClick={handleItemClick} />
      )}

      <HorizontalTree
        data={subredditPath}
        handleNodeClick={setCurrentNode}
        currentNode={currentNode}
        snoovatarUrl={player?.snoovatarUrl}
        ref={ref}
      />
    </div>
  );
};
