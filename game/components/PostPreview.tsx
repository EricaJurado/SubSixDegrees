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
          <button
            onClick={() => onItemClick('subreddit', post.subreddit, post.subreddit)}
            className="subreddit-link"
          >
            r/{post.subreddit}
          </button>
        )}
        <button
          onClick={() => onItemClick('user', post.authorName, post.authorName)}
          className="user-link"
        >
          u/{post.authorName}
        </button>
        <p>{post.createdAt}</p>
      </div>

      <button
        className="post-preview-title"
        onClick={() => onItemClick('post', post.title, post.postId)}
      >
        <h3 className="post-title">{post.title}</h3>
      </button>
      <div className="post-preview-body">
        {/* <p>{post.nsfw ? 'NSFW' : 'SFW'}</p> */}
        {post.body && <p className="preview-body-content">{post.body}</p>}
        {/* {post.bodyHtml && <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />} */}
        {post.thumbnail && (
          <div className="post-thumbnail">
            <img
              src={post.thumbnail.url}
              alt="thumbnail"
              width={post.thumbnail.width}
              height={post.thumbnail.height}
            />
          </div>
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
