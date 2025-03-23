import { ComponentProps, useState } from 'react';
import { useSetPage } from '../hooks/usePage';
import { sendToDevvit } from '../utils';

export const HomePage = ({ postId }: { postId: string }) => {
  const setPage = useSetPage();

  const [subredditPath, setSubredditPath] = useState<Record<string, string[]>>({});
  const [previousSubreddit, setPreviousSubreddit] = useState('start');
  const [currentSubreddit, setCurrentSubreddit] = useState('start');

  return (
    <div>
      <div />

      <h1>Welcome to Devvit</h1>
      <p>Let's build something awesome!</p>
      <p>PostId: {postId}</p>

      <button
        onClick={() => {
          sendToDevvit({
            type: 'DISCOVER_SUBREDDIT',
            payload: { subreddit: 'pokemon', previousSubreddit: '' }, // Add previousSubreddit
          });
        }}
      >
        Discover Pokemon
      </button>

      <MagicButton
        onClick={() => {
          setPage('home');
        }}
      >
        Show me more
      </MagicButton>

      <button
        onClick={() => {
          sendToDevvit({
            type: 'DISCOVER_SUBREDDIT',
            payload: { subreddit: 'r/javascript', previousSubreddit: currentSubreddit },
          });
          setPreviousSubreddit(currentSubreddit);
          setCurrentSubreddit('r/javascript');
        }}
      >
        Go to r/javascript
      </button>

      <button
        onClick={() => {
          sendToDevvit({
            type: 'DISCOVER_SUBREDDIT',
            payload: { subreddit: 'r/reactjs', previousSubreddit: currentSubreddit },
          });
          setPreviousSubreddit(currentSubreddit);
          setCurrentSubreddit('r/reactjs');
        }}
      >
        Go to r/reactjs
      </button>

      <button
        onClick={() => {
          sendToDevvit({
            type: 'DISCOVER_SUBREDDIT',
            payload: { subreddit: 'r/frontend', previousSubreddit: currentSubreddit },
          });
          setPreviousSubreddit(currentSubreddit);
          setCurrentSubreddit('r/frontend');
        }}
      >
        Go to r/frontend
      </button>
    </div>
  );
};

const MagicButton = ({ children, ...props }: ComponentProps<'button'>) => {
  return (
    <button {...props}>
      <span>{children}</span>
    </button>
  );
};
