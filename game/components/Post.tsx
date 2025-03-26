import React from 'react';
import { RedditPost } from '../shared';

type RedditPostProps = {
  post: RedditPost;
  comments?: any[];
  onItemClick: (type: 'subreddit' | 'user' | 'post', name: string, id: string) => void;
};

const Post: React.FC<RedditPostProps> = ({ post, comments, onItemClick }) => {
  return (
    <div>
      <h2>Preview: {post.title}</h2>
      <button
        onClick={() => onItemClick('post', post.postId, post.postId)}
        style={{ cursor: 'pointer', color: 'blue' }}
      >
        {post.title}
      </button>
      <button
        onClick={() => onItemClick('user', post.authorName, post.authorName)}
        style={{ cursor: 'pointer', color: 'blue' }}
      >
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
      <ul>
        {comments?.map((comment) => (
          <li key={comment.postId}>
            <strong>{comment.authorName}</strong>: {comment.body}
          </li>
        ))}
      </ul>
      {/* <p
        onClick={() => onItemClick('subreddit', post.subreddit)}
        style={{ cursor: 'pointer', color: 'blue' }}
      >
        r/{post.subreddit}
      </p> */}
    </div>
  );
};

export default Post;
