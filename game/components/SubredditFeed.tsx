import React from 'react';
import { RedditPost, SubredditFeedProps } from '../shared';

const SubredditFeed: React.FC<SubredditFeedProps> = ({ subreddit, feedData }) => {
  return (
    <div>
      <h1>{subreddit}</h1>
      <ul>
        {feedData.map((post: RedditPost) => (
          <li key={post.postId}>
            <h2>{post.title}</h2>
            <p>{post.authorName}</p>
            <p>{post.createdAt}</p>
            <p>{post.nsfw ? 'NSFW' : 'SFW'}</p>
            <p>{post.score}</p>
            <p>{post.numberOfComments}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubredditFeed;
