import React from 'react';

interface CommentCardProps {
  authorName: string;
  commentContent: string;
  onItemClick: (type: 'subreddit' | 'user' | 'post', name: string, id: string) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ authorName, commentContent, onItemClick }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
      <button onClick={() => onItemClick('user', authorName, authorName)}>{authorName}</button>
      <p>{commentContent}</p>
    </div>
  );
};

export default CommentCard;
