import React from 'react';
import { RedditPost, SubredditFeedProps } from '../shared';

const SubredditFeed: React.FC<SubredditFeedProps> = ({ subreddit, feedData, onItemClick }) => {
  return (
    <div>
      <h1>{subreddit}</h1>
      <ul>
        {feedData.map((post: RedditPost) => (
          <li key={post.postId}>
            <h2>{post.title}</h2>
            <button
              onClick={() => onItemClick('user', post.authorName)}
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
            {/* <p
              onClick={() => onItemClick('subreddit', post.subreddit)}
              style={{ cursor: 'pointer', color: 'blue' }}
            >
              r/{post.subreddit}
            </p> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubredditFeed;
