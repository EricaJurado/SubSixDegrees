export type Page =
  | "home" | "dailyChallenge";

export type WebviewToBlockMessage = 
  | { type: "INIT"; payload: { } }
  | {
      type: "DISCOVER_SUBREDDIT";
      payload: { subreddit: string, previousSubreddit: string };
    }
  | { type: "GET_SUBREDDIT_FEED";
    payload: { subredditName: string };
  }
  | { type: "GET_POST_COMMENTS";
    payload: { postId: string };
  }
  | { type: "GET_USER_BY_USERNAME";
    payload: { username: string };
  }
  | { type: "COMMENT_ON_POST";
    payload: { postId: string, comment: string, base64Image: string };
  }
  | { type: "GET_POST";
    payload: { postId: string };
  }
  | { type: "GET_USER_POSTS";
    payload: { username: string };
  }
  | { type: "GET_USER_COMMENTS";
    payload: { username: string };
  };

export type BlocksToWebviewMessage =
  | {
      type: "INIT_RESPONSE";
      payload: {
        postId: string;
        subredditPath: Record<string, string[]>;
        createdAt: string;
      };
    }
  | {
      type: "UPDATE_SUBREDDIT_PATH";
      payload: {
        subredditPath: Record<string, string[]>; 
      };
    }
  | {
      type: "DISCOVER_SUBREDDIT";
      payload: {
        subreddit: string;
        previousSubreddit: string;
      };
    }
    | {type: "SUBREDDIT_FEED", payload: { posts: any[], subreddit:any, error?: boolean }}
    | {type: "testing", payload: { posts: string }}
    | {type: "POST_COMMENTS", payload: { comments: any[] }}
    | {type: "USER_BY_USERNAME", payload: { user: any }}
    | {type: "PLAYER", payload: { 
      id: string;
      username: string;
      snoovatarUrl: string;
     }}
    | {type: "POST", payload: { 
      postId: string;
      title: string;
      authorName: string;
      body: string;
      bodyHtml: string;
      createdAt: string;
      nsfw: boolean;
      score: number;
      numberOfComments: number;
      thumbnail: any;
      secureMedia: any;
      subreddit: string;
     }}
    | {type: "USER_POSTS", payload: { posts: any[] }}
    | {type: "USER_COMMENTS", payload: { comments: any[] }};


export type DevvitMessage = {
  type: "devvit-message";
  data: { message: BlocksToWebviewMessage };
};

export type Node = {
  name: string;
  id: string;
  type: ('subreddit' | 'user' | 'post');
  children: Node[];
  isLeafDuplicate?: boolean;
};

export type thumbnail = {
  url: string;
  width: number;
  height: number;
};

export type secureMedia = {
  oembed?: any;
  redditVideo?: any;
  type?: string;
}

export interface RedditPost {
  postId: string;
  title: string;
  authorName: string;
  body: string;
  bodyHtml: string;
  createdAt: string; // time ago
  nsfw: boolean;
  score: number;
  numberOfComments: number;
  thumbnail: thumbnail;
  secureMedia: secureMedia;
  subreddit: string;
}

export interface RedditComment {
  id: string;
  postId: string;
  body: string;
  authorId: string;
  authorName: string;
  snoovatarURL: string;
  subreddit: string;
}

export type Subreddit = {
  name: string | undefined;
  id: `t5_${string}` | undefined;
  isNsfw: boolean;
  description: string;
  subscribersCount: number;
};

export interface SubredditFeedProps {
  subredditName: string;
  subreddit: Subreddit;
  feedData: RedditPost[];
  onItemClick: (type: 'subreddit' | 'user' | 'post', name: string, id: string) => void;
  bannerImage: string;
  icon: string;
}

export type redditUser = {
  id: string;
  username: string;
  snoovatarUrl: string;
  isAdmin: boolean;
  nsfw: boolean;
}
