import React from 'react';

interface CommentCardProps {
  subreddit: string;
  postId: string;
  authorName: string;
  commentContent: string;
  showSubreddit?: boolean;
  onItemClick: (type: 'subreddit' | 'user' | 'post', name: string, id: string) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  subreddit,
  authorName,
  commentContent,
  showSubreddit = true,
  onItemClick,
}) => {
  return (
    <>
      <div className="post-preview-header">
        {showSubreddit && (
          <button onClick={() => onItemClick('subreddit', subreddit, subreddit)}>
            r/{subreddit}
          </button>
        )}
        <button onClick={() => onItemClick('user', authorName, authorName)}>u/{authorName}</button>
      </div>
      <p>{commentContent}</p>
    </>
  );
};

export default CommentCard;
