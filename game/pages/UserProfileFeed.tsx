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
  return (
    <>
      <UserProfile
        redditUser={{
          username: currUserObject.username,
          id: currUserObject.id,
          snoovatarUrl: currUserObject.snoovatarUrl,
          isAdmin: currUserObject.isAdmin,
          nsfw: currUserObject.nsfw,
        }}
      />
      {posts && (
        <div>
          <h2>Posts</h2>
          {posts.map((post) => (
            <div key={post.postId}>
              <PostPreview post={post} showSubreddit={true} onItemClick={handleItemClick} />
            </div>
          ))}
        </div>
      )}
      {comments && (
        <div>
          <h2>Comments</h2>
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
    </>
  );
};

export default UserProfileFeed;
