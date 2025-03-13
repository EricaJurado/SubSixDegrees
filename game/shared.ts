export type Page =
  | "home";

export type WebviewToBlockMessage = 
  | { type: "INIT" }
  | {
      type: "DISCOVER_SUBREDDIT";
      payload: { subreddit: string };
    };

export type BlocksToWebviewMessage = 
  | {
      type: "INIT_RESPONSE";
      payload: {
        postId: string;
        subredditPath: string[];
      };
    }
  | {
      type: "UPDATE_SUBREDDIT_PATH";
      payload: {
        subredditPath: string[];
      };
    };

export type DevvitMessage = {
  type: "devvit-message";
  data: { message: BlocksToWebviewMessage };
};
