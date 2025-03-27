import React from 'react';
import { RedditPost } from '../shared';
import CommentCard from './CommentCard';

type RedditPostProps = {
  post: RedditPost;
  comments?: any[];
  onItemClick: (type: 'subreddit' | 'user' | 'post', name: string, id: string) => void;
};

const Post: React.FC<RedditPostProps> = ({ post, comments, onItemClick }) => {
  return (
    <div>
      <h2>Preview: {post.title}</h2>
      <button onClick={() => onItemClick('post', post.postId, post.postId)}>{post.title}</button>
      <button onClick={() => onItemClick('user', post.authorName, post.authorName)}>
        {post.authorName}
      </button>
      <p>{post.createdAt}</p>
      <p>{post.nsfw ? 'NSFW' : 'SFW'}</p>
      <p>{post.score}</p>
      <p>{post.numberOfComments}</p>
      {post.bodyHtml && <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />}
      {post.thumbnail && (
        <img
          src={post.thumbnail.url}
          alt="thumbnail"
          width={post.thumbnail.width}
          height={post.thumbnail.height}
        />
      )}
      <h3>Comments</h3>
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
            />
          );
        }
      })}
      {/* <p
        onClick={() => onItemClick('subreddit', post.subreddit)}
      >
        r/{post.subreddit}
      </p> */}
    </div>
  );
};

export default Post;
