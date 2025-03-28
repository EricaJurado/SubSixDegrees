import { RedditAPIClient, RichTextBuilder } from '@devvit/public-api';
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
      console.log(subredditData.description)
      const subredditInfo: Subreddit = {
        name: subreddit,
        id: subredditData?.id || 't5_example',
        isNsfw: subredditData?.isNsfw || false,
        description: subredditData?.description?.markdown || '',
        subscribersCount: subredditData?.subscribersCount || 0,
      }
      console.log(subredditInfo);
      return subredditInfo;
    } catch (error) {
      console.error(`Error fetching subreddit data: ${error}`);
      throw error;
    }
  }

  async getSubredditStyles(subreddit: string): Promise<any> {
    try {
      const styles = await this.reddit.getSubredditStyles(subreddit);
      const subredditStyles = {
        bannerImage: styles.bannerBackgroundImage,
        icon: styles.icon,
      }
      return subredditStyles;
    } catch (error) {
      console.error(`Error fetching subreddit styles: ${error}`);
      throw error;
    }
  }

  // Get top posts from a subreddit with pagination support
  async getTopPosts(subreddit: string, limit: number = 20, after: string = ''): Promise<any[]> {
    try {
      const posts = await this.reddit.getTopPosts({
        subredditName: subreddit,
        limit: limit,
        after: after, //id
      }).all();
      
      return posts;
    } catch (error) {
      console.error(`Error fetching posts from subreddit: ${error}`);
      throw error;
    }
  }


  // Get new posts from a subreddit
  async getNewPosts(subreddit: string, limit: number = 20, after: string = ''): Promise<any[]> {
    try {
      const posts = await this.reddit.getNewPosts({
        subredditName: subreddit,
        limit: limit,
        after: after, //id
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

  // get post by id
  async getPostById(postId: string): Promise<any> {
    try {
      const post = await this.reddit.getPostById(postId);
      return post;
    } catch (error) {
      console.error(`Error fetching post by id ${postId}: ${error}`);
      throw error;
    }
  }

  // Get comments from a specific post in a subreddit
  async getPostComments(postId: string): Promise<any[]> {
    try {
      const comments = await this.reddit
  .getComments({
    postId: postId,
    limit: 20,
    pageSize: 20,
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

  async getUserPostsByName(username: string): Promise<any[]> {
    try {
      const posts = await this.reddit.getPostsByUser({ username: username, sort: "new", pageSize: 15, limit: 15}).all();
      return posts;
    } catch (error) {
      console.error(`Error fetching posts for user ${username}: ${error}`);
      throw error;
    }
  }

  async getUserCommentsByName(username: string): Promise<any[]> {
    try {
      const comments = await this.reddit.getCommentsByUser({ username: username, sort: "new", pageSize: 15, limit: 15}).all();
      return comments;
    }
    catch (error) {
      console.error(`Error fetching comments for user ${username}: ${error}`);
      throw error;
    }
  }

  async commentOnPost(postId: string, comment: string, mediaId: any ): Promise<void> {
    console.log(`Commenting on post ${postId}: ${comment}`);
    try {
      await this.reddit.submitComment({
        id: postId,
        // text: comment,
        richtext: new RichTextBuilder().image({mediaId: mediaId}),
      });
    } catch (error) {
      console.error(`Error commenting on post ${postId}: ${error}`);
      throw error;
    }
  }
}
