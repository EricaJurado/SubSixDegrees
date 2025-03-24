import React, { useState, useEffect } from 'react';

interface RedditPost {
  title: string;
  author: string;
  url: string;
  subreddit: string;
  score: number;
  num_comments: number;
}

interface SubredditFeedProps {
  subreddit: string;
  feedData: any;
}

const SubredditFeed: React.FC<SubredditFeedProps> = ({ subreddit, feedData }) => {
  return (
    <div>
      <h1>{subreddit}</h1>
      <ul>
        {feedData.map((post: RedditPost, index: number) => (
          <li key={index}>
            <div>{post.title}</div>
            <div>{post.author}</div>
            <div>{post.url}</div>
            <div>{post.subreddit}</div>
            <div>{post.score}</div>
            <div>{post.num_comments}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubredditFeed;
