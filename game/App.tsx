import { Page } from './shared';
import { HomePage } from './pages/HomePage';
import { usePage } from './hooks/usePage';
import { useEffect, useState } from 'react';
import { sendToDevvit } from './utils';
import { useDevvitListener } from './hooks/useDevvitListener';
import dailyChallenges from './dailyChallenges.json';

const getPage = (page: Page, { postId }: { postId: string }) => {
  switch (page) {
    case 'home':
      return <HomePage postId={postId} />;
    default:
      throw new Error(`Unknown page: ${page satisfies never}`);
  }
};

export const App = () => {
  const [postId, setPostId] = useState('');
  const page = usePage();
  const initData = useDevvitListener('INIT_RESPONSE');

  // get today's date and get the corresponding dailyChallenge
  const today = new Date().toLocaleDateString();
  console.log(today);
  const allChallenges = dailyChallenges as Record<string, string[]>;
  const todaysChallenge = allChallenges[today];
  const startSubreddit = todaysChallenge[0];
  console.log(todaysChallenge);

  useEffect(() => {
    sendToDevvit({ type: 'INIT', payload: {} });
    sendToDevvit({ type: 'GET_SUBREDDIT_FEED', payload: { subredditName: startSubreddit } });
  }, []);

  useEffect(() => {
    if (initData) {
      setPostId(initData.postId);
    }
  }, [initData, setPostId]);

  return <div>{getPage(page, { postId })}</div>;
};
