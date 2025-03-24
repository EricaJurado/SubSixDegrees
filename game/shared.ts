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
    | {type: "testing", payload: { posts: string }};


export type DevvitMessage = {
  type: "devvit-message";
  data: { message: BlocksToWebviewMessage };
};

export type SubredditNode = {
  name: string;
  children: SubredditNode[];
};
