export type Page =
  | "home";

export type WebviewToBlockMessage = 
  | { type: "INIT" }
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
  };

export type BlocksToWebviewMessage =
  | {
      type: "INIT_RESPONSE";
      payload: {
        postId: string;
        subredditPath: Record<string, string[]>;
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
    | {type: "SUBREDDIT_FEED", payload: { posts: any[] }}
    | {type: "testing", payload: { posts: string }}
    | {type: "POST_COMMENTS", payload: { comments: any[] }}
    | {type: "USER_BY_USERNAME", payload: { user: any }};


export type DevvitMessage = {
  type: "devvit-message";
  data: { message: BlocksToWebviewMessage };
};

export type SubredditNode = {
  name: string;
  children: SubredditNode[];
};

export type Node = {
  name: string;
  id: string;
  type: ('subreddit' | 'user' | 'post');
  children: Node[];
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
}

export interface SubredditFeedProps {
  subreddit: string;
  feedData: RedditPost[];
  onItemClick: (type: 'subreddit' | 'user' | 'post', name: string, id: string) => void;
}

export type redditUser = {
  id: string;
  username: string;
  snoovatarUrl: string;
  isAdmin: boolean;
  nsfw: boolean;
}
