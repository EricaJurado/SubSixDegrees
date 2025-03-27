import React from 'react';

interface CommentCardProps {
  subreddit: string;
  postId: string;
  authorName: string;
  commentContent: string;
  onItemClick: (type: 'subreddit' | 'user' | 'post', name: string, id: string) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  subreddit,
  postId,
  authorName,
  commentContent,
  onItemClick,
}) => {
  return (
    <div>
      <button onClick={() => onItemClick('subreddit', subreddit, subreddit)}>r/{subreddit}</button>
      {/* <button onClick={() => onItemClick('post', postId, postId)}>{postId}</button> */}
      <button onClick={() => onItemClick('user', authorName, authorName)}>u/{authorName}</button>
      <p>{commentContent}</p>
    </div>
  );
};

export default CommentCard;
