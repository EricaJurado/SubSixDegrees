import { RedditAPIClient } from '@devvit/public-api';
import { Subreddit } from '../game/shared.js';

export class RedditService {
  readonly reddit: RedditAPIClient;

  constructor(context: { reddit: RedditAPIClient }) {
    this.reddit = context.reddit;
  }

  // Get details of a specific subreddit
  async getSubredditDetails(subreddit: string): Promise<any> {
    try {
      const subredditData = await this.reddit.getSubredditInfoByName(subreddit);
      const subredditInfo: Subreddit = {
        name: subreddit,
        id: subredditData.id || 't5_example',
        isNsfw: subredditData.isNsfw || false,
        description: subredditData.description?.markdown || '',
        subscribersCount: subredditData.subscribersCount || 0,
      }
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

  // get controversial
  // get hot
  // get rising

  // Get comments from a specific post in a subreddit
  async getPostComments(postId: string): Promise<any[]> {
    try {
      const comments = await this.reddit
  .getComments({
    postId: postId,
    limit: 10,
    pageSize: 10,
  })
  .all();
      return comments;
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}: ${error}`);
      throw error;
    }
  }

  // Get user details by username
  async getUserByUsername(username: string): Promise<any> {
    try {
      const user = await this.reddit.getUserByUsername(username);
      const snoovatarUrl = await this.reddit.getSnoovatarUrl(username);
      const userWithSnoovatar = { ...user, snoovatarUrl };
      return userWithSnoovatar;
    } catch (error) {
      console.error(`Error fetching user data for ${username}: ${error}`);
      throw error;
    }
  }
}
