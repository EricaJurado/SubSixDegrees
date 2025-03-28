import React from 'react';
import { RedditPost } from '../shared';
import CommentCard from './CommentCard';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

type RedditPostProps = {
  post: RedditPost;
  comments?: any[];
  onItemClick: (type: 'subreddit' | 'user' | 'post', name: string, id: string) => void;
};

const Post: React.FC<RedditPostProps> = ({ post, comments, onItemClick }) => {
  return (
    <div id="post">
      <div className="post-preview-header">
        <button onClick={() => onItemClick('subreddit', post.subreddit, post.subreddit)}>
          r/{post.subreddit}
        </button>
        <button onClick={() => onItemClick('user', post.authorName, post.authorName)}>
          u/{post.authorName}
        </button>
        <p>{post.createdAt}</p>
      </div>
      <h3 className="post-title">{post.title}</h3>
      {post.bodyHtml && <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />}
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

      <h3>Comments</h3>
      <div className="comments-container">
        {comments?.map((comment) => {
          if (comment.authorName !== 'AutoModerator') {
            return (
              <CommentCard
                key={comment.id}
                subreddit={post.subreddit}
                postId={post.postId}
                authorName={comment.authorName}
                commentContent={comment.body}
                onItemClick={onItemClick}
                showSubreddit={false}
              />
            );
          }
        })}
      </div>

      {/* <p
        onClick={() => onItemClick('subreddit', post.subreddit)}
      >
        r/{post.subreddit}
      </p> */}
    </div>
  );
};

export default Post;
