import { Page } from './shared';
import { HomePage } from './pages/HomePage';
import { usePage } from './hooks/usePage';
import { useEffect, useState } from 'react';
import { sendToDevvit } from './utils';
import { useDevvitListener } from './hooks/useDevvitListener';
import dailyChallenges from './dailyChallenges.json';
import { start } from 'repl';

const getPage = (
  page: Page,
  {
    postId,
    startSubreddit,
    targetSubreddit,
  }: { postId: string; startSubreddit: string; targetSubreddit: string }
) => {
  switch (page) {
    case 'dailyChallenge':
      return (
        <HomePage
          postId={postId}
          startSubreddit={startSubreddit}
          targetSubreddit={targetSubreddit}
        />
      );
    case 'home':
      return (
        <HomePage
          postId={postId}
          startSubreddit={startSubreddit}
          targetSubreddit={targetSubreddit}
        />
      );
    default:
      throw new Error(`Unknown page: ${page satisfies never}`);
  }
};

export const App = () => {
  const [postId, setPostId] = useState('');
  const [postCreatedAt, setPostCreatedAt] = useState('');
  const page = usePage();
  const initData = useDevvitListener('INIT_RESPONSE');

  const allChallenges = dailyChallenges as Record<string, string[]>;
  const defaultToFrom = allChallenges[new Date().toLocaleDateString()];
  const startSubreddit = defaultToFrom[0] || 'AskReddit';
  const targetSubreddit = defaultToFrom[1] || 'FoodPorn';
  const [toFrom, setToFrom] = useState([startSubreddit, targetSubreddit]);

  useEffect(() => {
    sendToDevvit({ type: 'INIT', payload: {} });
  }, []);

  useEffect(() => {
    if (initData) {
      setPostCreatedAt(initData.createdAt);
      setPostId(initData.postId);

      const targetDate = postCreatedAt ? postCreatedAt : new Date().toLocaleDateString();
      const dailyChallenge = allChallenges[targetDate];
      if (dailyChallenge && dailyChallenge.length === 2) {
        setToFrom(dailyChallenge);
      }
    }
  }, [initData?.createdAt]);

  return (
    <div>{getPage(page, { postId, startSubreddit: toFrom[0], targetSubreddit: toFrom[1] })}</div>
  );
};
