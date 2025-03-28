import { Page } from './shared';
import { HomePage } from './pages/HomePage';
import { usePage } from './hooks/usePage';
import { useEffect, useState } from 'react';
import { sendToDevvit } from './utils';
import { useDevvitListener } from './hooks/useDevvitListener';
import dailyChallenges from './dailyChallenges.json';

const allChallenges = dailyChallenges as Record<string, string[]>;

const getPage = (
  page: Page,
  { postId, postCreatedAt }: { postId: string; postCreatedAt: string }
) => {
  console.log(postId);
  const dailyChallenge = allChallenges[postCreatedAt || '3/27/2025'];
  let startSubreddit = dailyChallenge[0];
  let targetSubreddit = dailyChallenge[1];
  switch (page) {
    case 'dailyChallenge':
      // what is this post's date create date?
      if (!startSubreddit || !targetSubreddit) {
        startSubreddit = 'AskReddit';
        targetSubreddit = 'FoodPorn';
      }
      return (
        <HomePage
          postId={postId}
          startSubreddit={startSubreddit}
          targetSubreddit={targetSubreddit}
        />
      );
    case 'home':
      // what is this post's date create date?
      if (!startSubreddit || !targetSubreddit) {
        startSubreddit = 'AskReddit';
        targetSubreddit = 'FoodPorn';
      }
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

  // get today's date and get the corresponding dailyChallenge
  const today = new Date().toLocaleDateString();
  const allChallenges = dailyChallenges as Record<string, string[]>;
  const todaysChallenge = allChallenges[today];
  const startSubreddit = todaysChallenge[0];

  useEffect(() => {
    sendToDevvit({ type: 'INIT', payload: {} });
    sendToDevvit({ type: 'GET_SUBREDDIT_FEED', payload: { subredditName: startSubreddit } });
  }, []);

  useEffect(() => {
    if (initData) {
      console.log(initData);
      setPostCreatedAt(initData.createdAt);
      setPostId(initData.postId);
    }
  }, [initData, setPostId]);

  return <div>{getPage(page, { postId, postCreatedAt })}</div>;
};
