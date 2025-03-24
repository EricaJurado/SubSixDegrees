import { RedditAPIClient } from '@devvit/public-api';

export class RedditService {
  readonly reddit: RedditAPIClient;

  constructor(context: { reddit: RedditAPIClient }) {
    this.reddit = context.reddit;
  }

  // Get details of a specific subreddit
  async getSubredditDetails(subreddit: string): Promise<any> {
    try {
      const subredditData = await this.reddit.getSubredditInfoByName(subreddit);
      return subredditData;
    } catch (error) {
      console.error(`Error fetching subreddit data: ${error}`);
      throw error;
    }
  }

  // Get top posts from a subreddit
  async getTopPosts(subreddit: string, limit: number = 2): Promise<any[]> {
    try {
      const posts = await this.reddit.getTopPosts({
        subredditName: subreddit,
        limit: limit,
      }).all();
      return posts;
    } catch (error) {
      console.error(`Error fetching posts from subreddit: ${error}`);
      throw error;
    }
  }

  // Get new posts from a subreddit
  async getNewPosts(subreddit: string, limit: number = 10): Promise<any[]> {
    try {
      const posts = await this.reddit.getNewPosts({
        subredditName: subreddit,
        limit: limit,
      }).all();
      return posts;
    } catch (error) {
      console.error(`Error fetching new posts from subreddit: ${error}`);
      throw error;
    }
  }

  // Get comments from a specific post in a subreddit
  async getPostComments(postId: string): Promise<any[]> {
    try {
      const comments = await this.reddit
  .getComments({
    postId: postId,
    limit: 1000,
    pageSize: 100,
  })
  .all();
      return comments;
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}: ${error}`);
      throw error;
    }
  }
}
