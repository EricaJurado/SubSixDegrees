import PostPreview from '../components/PostPreview';
import { RedditPost, SubredditFeedProps } from '../shared';

const SubredditFeed: React.FC<SubredditFeedProps> = ({ subreddit, feedData, onItemClick }) => {
  return (
    <div>
      <h1>{subreddit}</h1>
      <ul>
        {feedData.map((post: RedditPost) => (
          <li key={post.postId}>
            <PostPreview post={post} onItemClick={onItemClick} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubredditFeed;
