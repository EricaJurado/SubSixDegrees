import { useState } from 'react';
import CommentCard from '../components/CommentCard';
import PostPreview from '../components/PostPreview';
import UserProfile from '../components/UserProfile';
import { RedditComment, RedditPost } from '../shared';

interface UserProfileFeedProps {
  comments: RedditComment[] | [];
  posts: RedditPost[] | [];
  currUserObject: any;
  handleItemClick: any;
}

const UserProfileFeed: React.FC<UserProfileFeedProps> = ({
  comments,
  posts,
  currUserObject,
  handleItemClick,
}) => {
  const [currTab, setCurrTab] = useState('posts');

  return (
    <div id="user-profile-feed">
      <UserProfile
        redditUser={{
          username: currUserObject.username,
          id: currUserObject.id,
          snoovatarUrl: currUserObject.snoovatarUrl,
          isAdmin: currUserObject.isAdmin,
          nsfw: currUserObject.nsfw,
        }}
      />
      <div id="user-profile-feed-tabs" className="tabs">
        <button
          className={currTab == 'posts' ? 'currentTab' : ''}
          onClick={() => setCurrTab('posts')}
        >
          Posts
        </button>
        <button
          className={currTab == 'comments' ? 'currentTab' : ''}
          onClick={() => setCurrTab('comments')}
        >
          Comments
        </button>
      </div>
      {currTab === 'posts' && (
        <div>
          {posts && posts.length === 0 && <p>No posts yet</p>}
          {posts.map((post) => (
            <div key={post.postId}>
              <PostPreview post={post} showSubreddit={true} onItemClick={handleItemClick} />
            </div>
          ))}
        </div>
      )}
      {currTab === 'comments' && (
        <div>
          {comments && comments.length === 0 && <p>No comments yet</p>}
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              subreddit={comment.subreddit}
              postId={comment.postId}
              commentContent={comment.body}
              authorName={comment.authorName}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfileFeed;
