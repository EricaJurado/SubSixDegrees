import { useEffect, useRef, useState } from 'react';
import HorizontalTree from '../graphs/HorizontalTree';
import { sendToDevvit } from '../utils';
import { RedditPost, Node, Subreddit } from '../shared';
import { useDevvitListener } from '../hooks/useDevvitListener';
import UserFeed from '../components/UserFeed';
import SubredditFeed from '../pages/SubredditFeed';
import Post from '../components/Post';
import dailyChallenges from '../dailyChallenges.json';
import PostPreview from '../components/PostPreview';
import CommentCard from '../components/CommentCard';
import MapIcon from '@mui/icons-material/Map';
import HelpIcon from '@mui/icons-material/Help';
import HowTo from '../components/HowTo';

const calculateShortestDistance = (
  subredditPath: Node,
  startSubreddit: string,
  targetSubreddit: string
): number => {
  // Helper function to perform BFS (Breadth-First Search)
  const bfs = (root: Node, start: string, target: string): number => {
    const queue: { node: Node; distance: number }[] = [{ node: root, distance: 0 }];
    const visited = new Set<string>(); // Track visited nodes to avoid cycles

    while (queue.length > 0) {
      const { node, distance } = queue.shift()!; // Get the next node and its distance

      if (node.name.toLowerCase() === target.toLowerCase()) {
        return distance; // Found the target subreddit, return the distance
      }

      visited.add(node.id);

      // Add children nodes to the queue if not visited
      for (const child of node.children) {
        if (!visited.has(child.id)) {
          queue.push({ node: child, distance: distance + 1 });
        }
      }
    }

    return -1; // Return -1 if targetSubreddit is not found
  };

  return bfs(subredditPath, startSubreddit, targetSubreddit);
};

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
  const [subredditPosts, setSubredditPosts] = useState<RedditPost[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [currUserObject, setCurrUserObject] = useState<any | null>(null);
  const [view, setView] = useState<'subreddit' | 'post' | 'user'>('subreddit');

  const subredditFeedData = useDevvitListener('SUBREDDIT_FEED');
  const commentsData = useDevvitListener('POST_COMMENTS');
  const userByUsername = useDevvitListener('USER_BY_USERNAME');
  const player = useDevvitListener('PLAYER');
  const post = useDevvitListener('POST');
  const userPosts = useDevvitListener('USER_POSTS');
  const userComments = useDevvitListener('USER_COMMENTS');

  const sendRequest = (message: {
    type:
      | 'GET_SUBREDDIT_FEED'
      | 'GET_POST_COMMENTS'
      | 'GET_USER_BY_USERNAME'
      | 'DISCOVER_SUBREDDIT'
      | 'COMMENT_ON_POST'
      | 'GET_POST'
      | 'GET_USER_POSTS'
      | 'GET_USER_COMMENTS';
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

  const getUserPosts = (username: string) =>
    sendRequest({ type: 'GET_USER_POSTS', payload: { username } });

  const getUserComments = (username: string) =>
    sendRequest({ type: 'GET_USER_COMMENTS', payload: { username } });

  const getPost = (postId: string) => sendRequest({ type: 'GET_POST', payload: { postId } });

  useEffect(() => {
    if (subredditFeedData) setSubredditPosts(subredditFeedData.posts || []);
  }, [subredditFeedData]);

  useEffect(() => {
    if (commentsData) setComments(commentsData.comments || []);
  }, [commentsData]);

  useEffect(() => {
    if (userByUsername) {
      setCurrUserObject(userByUsername?.user || null);
    }
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

    teleportToNode(newNode);
  };

  const teleportToNode = (node: Node) => {
    if (node.type === 'subreddit') {
      getSubredditFeed(node.name);
      setView('subreddit');
    } else if (node.type === 'user') {
      getUserByUsername(node.name);
      getUserPosts(node.name);
      getUserComments(node.name);
      setView('user');
    } else if (node.type === 'post') {
      console.log('teleporting to post', node);
      getPost(node.name);
      getPostComments(node.name);
      setView('post');
    }
  };

  useEffect(() => {
    console.log(userPosts);
  }, [userPosts]);

  useEffect(() => {
    console.log(userComments);
  }, [userComments]);

  const handleNodeClick = (node: Node) => {
    setCurrentNode(node);
    teleportToNode(node);
    setShowMap(false);
  };

  useEffect(() => {
    if (currentNode?.id.toString() === targetSubreddit.toLowerCase()) {
      console.log('WIN!!!!');
      const shortestPath = calculateShortestDistance(
        subredditPath,
        startSubreddit,
        targetSubreddit
      );
      console.log('Shortest Path:', shortestPath);
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
      console.log(postId);
      sendRequest({
        type: 'COMMENT_ON_POST',
        payload: { postId: postId, comment: 'This is a test comment', base64Image: base64OfSVG },
      });
      URL.revokeObjectURL(url); // Clean up
    };
    img.src = url;
    return img;
  };

  useEffect(() => {
    console.log(subredditPath);
    const distance = calculateShortestDistance(subredditPath, startSubreddit, targetSubreddit);
    console.log('Distance:', distance);
  }, [subredditPath]);

  const [showMap, setShowMap] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const toggleMenu = (target: string) => {
    if (target === 'map') {
      setShowMap(!showMap);
      if (showHowTo) setShowHowTo(false);
    } else if (target === 'howTo') {
      setShowHowTo(!showHowTo);
      if (showMap) setShowMap(false);
    }
  };

  return (
    <div>
      <div id="menu">
        <div id="goal-banner">
          <h1 id="goal-text">
            <button onClick={() => handleItemClick('subreddit', startSubreddit, startSubreddit)}>
              r/{startSubreddit}
            </button>
            to r/{targetSubreddit}
          </h1>
          <button onClick={() => toggleMenu('howTo')} className="menu-button">
            <p>{showHowTo ? 'Hide ' : 'Show '}</p>
            <HelpIcon style={{ color: 'white' }} />
          </button>
          <button onClick={() => toggleMenu('map')} className="menu-button">
            <p>{showMap ? 'Hide ' : 'Show '}</p>
            <MapIcon style={{ color: 'white' }} />
          </button>
        </div>

        <div id="menu-container">
          <div
            className="menu-popup"
            style={{ display: showHowTo ? 'block' : 'none' }}
            id="how-to-play"
          >
            <HowTo />
          </div>
          <div className="menu-popup" style={{ display: showMap ? 'block' : 'none' }}>
            <div id="graph-container">
              <HorizontalTree
                data={subredditPath}
                handleNodeClick={handleNodeClick}
                currentNode={currentNode}
                snoovatarUrl={player?.snoovatarUrl}
                ref={ref}
                prepImageForComment={prepImageForComment}
              />
            </div>
            <button onClick={testCommentTrigger}>Test Comment</button>
          </div>
        </div>
      </div>
      {/* 
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
      </button> */}
      <>
        {view === 'subreddit' && subredditFeedData && (
          <>
            {subredditFeedData.subreddit.isNsfw && <p>NSFW</p>}
            {/* make sure ! */}
            {!subredditFeedData.subreddit.isNsfw && (
              <SubredditFeed
                subredditName={subredditFeedData.subreddit.name || ''}
                subreddit={subredditFeedData.subreddit || {}}
                feedData={subredditPosts}
                onItemClick={handleItemClick}
                bannerImage={subredditFeedData.subreddit.styles.bannerImage}
                icon={subredditFeedData.subreddit.styles.icon}
              />
            )}
          </>
        )}

        {view === 'user' && currUserObject && (
          <>
            {currUserObject.nsfw && <p>NSFW</p>}
            {!currUserObject.nsfw && (
              <>
                <UserFeed
                  redditUser={{
                    username: currUserObject.username,
                    id: currUserObject.id,
                    snoovatarUrl: currUserObject.snoovatarUrl,
                    isAdmin: currUserObject.isAdmin,
                    nsfw: currUserObject.nsfw,
                  }}
                />
                {userPosts && (
                  <div>
                    <h2>Posts</h2>
                    {userPosts.posts.map((post) => (
                      <div key={post.postId}>
                        <PostPreview
                          post={post}
                          showSubreddit={true}
                          onItemClick={handleItemClick}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {userComments && (
                  <div>
                    <h2>Comments</h2>
                    {userComments.comments.map((comment) => (
                      <CommentCard
                        key={comment.id}
                        subreddit={comment.subreddit}
                        postId={comment.postId}
                        commentContent={comment.body}
                        authorName={comment.authorName}
                        onItemClick={handleItemClick}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {view === 'post' && post && comments && (
          <>
            {post.nsfw && <p>NSFW</p>}
            {!post.nsfw && <Post post={post} comments={comments} onItemClick={handleItemClick} />}
          </>
        )}
      </>
    </div>
  );
};
