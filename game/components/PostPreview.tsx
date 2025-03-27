import React from 'react';
import { RedditPost } from '../shared';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

type RedditPostProps = {
  post: RedditPost;
  showSubreddit?: boolean;
  onItemClick: (type: 'subreddit' | 'user' | 'post', name: string, id: string) => void;
};

const PostPreview: React.FC<RedditPostProps> = ({ post, showSubreddit, onItemClick }) => {
  return (
    <div className="post-preview">
      <div className="post-preview-header">
        {showSubreddit && post.subreddit && (
          <p
            onClick={() => onItemClick('subreddit', post.subreddit, post.subreddit)}
            className="subreddit-link"
          >
            r/{post.subreddit}
          </p>
        )}
        <button
          onClick={() => onItemClick('user', post.authorName, post.authorName)}
          className="user-link"
        >
          u/{post.authorName}
        </button>
        <p>{post.createdAt}</p>
      </div>

      <button onClick={() => onItemClick('post', post.postId, post.postId)} className="post-link">
        {post.title}
      </button>
      <div className="post-preview-body">
        {/* <p>{post.nsfw ? 'NSFW' : 'SFW'}</p> */}
        {post.body && <p>{post.body}</p>}
        {/* {post.bodyHtml && <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />} */}
        {post.thumbnail && (
          <img
            src={post.thumbnail.url}
            alt="thumbnail"
            width={post.thumbnail.width}
            height={post.thumbnail.height}
          />
        )}
        <div className="post-stats">
          <div className="post-votes stats">
            <ArrowUpwardIcon />
            <p>{post.score}</p>
          </div>
          <div className="post-comments stats">
            <ChatBubbleOutlineIcon />
            <p>{post.numberOfComments}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
