import { useEffect, useRef, useState } from 'react';
import HorizontalTree from '../graphs/HorizontalTree';
import { sendToDevvit } from '../utils';
import { RedditPost, Node } from '../shared';
import { useDevvitListener } from '../hooks/useDevvitListener';
import SubredditFeed from '../pages/SubredditFeed';
import Post from '../components/Post';
import MapIcon from '@mui/icons-material/Map';
import HelpIcon from '@mui/icons-material/Help';
import HowTo from '../components/HowTo';
import UserProfileFeed from './UserProfileFeed';
import { calculateShortestDistance, insertNode } from '../pathNodeUtils';
import Win from '../components/Win';
import UndoIcon from '@mui/icons-material/Undo';
import CloseIcon from '@mui/icons-material/Close';

const jumpToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'auto',
  });
};

export const HomePage = ({
  postId,
  startSubreddit,
  targetSubreddit,
}: {
  postId: string;
  startSubreddit: string;
  targetSubreddit: string;
}) => {
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
  const subredditFeedPosts = useDevvitListener('SUBREDDIT_FEED_POSTS');
  const commentsData = useDevvitListener('POST_COMMENTS');
  const userByUsername = useDevvitListener('USER_BY_USERNAME');
  const player = useDevvitListener('PLAYER');
  const post = useDevvitListener('POST');
  const userPosts = useDevvitListener('USER_POSTS');
  const userComments = useDevvitListener('USER_COMMENTS');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subredditFeedPosts) {
      setSubredditPosts((prev) => [...prev, ...subredditFeedPosts.posts]);
    }
  }, [subredditFeedPosts]);

  useEffect(() => {
    sendToDevvit({ type: 'GET_SUBREDDIT_FEED', payload: { subredditName: startSubreddit } });
  }, []);

  useEffect(() => {
    if (subredditFeedData || commentsData || userByUsername || post || userPosts || userComments) {
      setLoading(false);
    }
  }, [subredditFeedData, commentsData, userByUsername, post, userPosts, userComments]);

  const sendRequest = (message: {
    type:
      | 'GET_SUBREDDIT_FEED'
      | 'GET_SUBREDDIT_POSTS'
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

  const [nodeHistory, setNodeHistory] = useState<Node[]>([
    {
      name: startSubreddit,
      type: 'subreddit',
      id: startSubreddit.toLowerCase(),
      children: [],
      isLeafDuplicate: false,
    },
  ]);

  const handleItemClick = (type: 'subreddit' | 'user' | 'post', name: string, id: string) => {
    let parentNode = currentNode || subredditPath;

    if (currentNode) {
      setNodeHistory((prev) => [...prev, currentNode]);
    }

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
    setLoading(true);
    if (node.type === 'subreddit') {
      getSubredditFeed(node.id);
      setView('subreddit');
    } else if (node.type === 'user') {
      getUserByUsername(node.id);
      getUserPosts(node.id);
      getUserComments(node.id);
      setView('user');
    } else if (node.type === 'post') {
      getPost(node.id);
      getPostComments(node.id);
      setView('post');
    }
    jumpToTop();
  };

  const handleNodeClick = (node: Node) => {
    setCurrentNode(node);
    teleportToNode(node);
    setShowMap(false);
  };

  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    if (currentNode?.id.toString() === targetSubreddit.toLowerCase()) {
      setHasWon(true);
      const shortestPath = calculateShortestDistance(
        subredditPath,
        startSubreddit,
        targetSubreddit
      );
    }
  }, [currentNode]);

  const ref = useRef<SVGSVGElement | null>(null);

  const [prepImageForComment, setPrepImageForComment] = useState(true);

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

  useEffect(() => {
    const distance = calculateShortestDistance(subredditPath, startSubreddit, targetSubreddit);
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

  const goBack = () => {
    if (nodeHistory.length === 0) return; // Prevent going back if no history

    const previousNode = nodeHistory[nodeHistory.length - 1]; // Get last visited node
    setNodeHistory((prev) => prev.slice(0, -1)); // Remove last node from history
    setCurrentNode(previousNode);
    teleportToNode(previousNode);
  };

  const getMorePosts = (subredditName: string, after?: string) => {
    const lastPostId = subredditPosts[subredditPosts.length - 1]?.postId;
    if (lastPostId) {
      after = lastPostId;
    }
    sendRequest({
      type: 'GET_SUBREDDIT_POSTS',
      payload: { subredditName, after },
    });
  };

  return (
    <div>
      <div id="menu">
        <div id="goal-banner">
          <button
            onClick={() => goBack()}
            className="menu-button"
            style={{ visibility: nodeHistory.length == 0 ? 'hidden' : 'visible' }}
          >
            <UndoIcon style={{ color: 'white' }} />
          </button>

          <h1 id="goal-text">
            <button onClick={() => handleItemClick('subreddit', startSubreddit, startSubreddit)}>
              r/{startSubreddit}
            </button>
            to r/{targetSubreddit}
          </h1>
          <button onClick={() => toggleMenu('howTo')} className="menu-button">
            <HelpIcon style={{ color: 'white' }} />
          </button>
          <button onClick={() => toggleMenu('map')} className="menu-button">
            <MapIcon style={{ color: 'white' }} />
          </button>
        </div>

        <div id="menu-container">
          <div
            className="menu-popup"
            style={{ display: showHowTo ? 'block' : 'none' }}
            id="how-to-play"
          >
            <button
              onClick={() => {
                setShowMap(false);
                setShowHowTo(false);
              }}
              id="esc-menu"
            >
              <CloseIcon />
            </button>
            <HowTo />
          </div>
          <div className="menu-popup" style={{ display: showMap ? 'block' : 'none' }}>
            <button
              onClick={() => {
                setShowMap(false);
                setShowHowTo(false);
              }}
              id="esc-menu"
            >
              <CloseIcon />
            </button>
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
          </div>
        </div>
      </div>
      <div
        id="main-page"
        onClick={() => {
          setShowMap(false);
          setShowHowTo(false);
        }}
      >
        {loading && <div className="loader"></div>}
        {!loading && !hasWon && (
          <>
            {view === 'subreddit' && subredditFeedData && (
              <>
                {subredditFeedData.subreddit.isNsfw && <p>NSFW</p>}
                {/* make sure ! */}
                {!subredditFeedData.subreddit.isNsfw && (
                  <div>
                    <SubredditFeed
                      subredditName={subredditFeedData.subreddit.name || ''}
                      subreddit={subredditFeedData.subreddit || {}}
                      feedData={subredditPosts}
                      onItemClick={handleItemClick}
                      bannerImage={subredditFeedData.subreddit.styles?.bannerImage}
                      icon={subredditFeedData.subreddit.styles?.icon}
                    />
                    <button
                      className="load-more"
                      onClick={() => getMorePosts(subredditFeedData?.subreddit.name)}
                    >
                      Load more
                    </button>
                  </div>
                )}
                {subredditFeedData.error && (
                  <p style={{ justifyContent: 'center', width: '100%', textAlign: 'center' }}>
                    Uh-oh, this subreddit doesn't exist.
                  </p>
                )}
              </>
            )}

            {view === 'user' && currUserObject && (
              <>
                {!currUserObject.nsfw && (
                  <UserProfileFeed
                    comments={userComments?.comments || []}
                    posts={userPosts?.posts || []}
                    currUserObject={currUserObject}
                    handleItemClick={handleItemClick}
                  />
                )}
              </>
            )}

            {view === 'post' && post && comments && (
              <>
                {post.nsfw && <p>NSFW</p>}
                {!post.nsfw && (
                  <Post post={post} comments={comments} onItemClick={handleItemClick} />
                )}
              </>
            )}
          </>
        )}
        {hasWon && (
          <Win
            onShare={() => setPrepImageForComment(false)}
            graph={
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
            }
          />
        )}
      </div>

      {/* <p>PostId: {postId}</p>
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
    </div>
  );
};
