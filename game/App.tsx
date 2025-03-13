import { Page } from './shared';
import { HomePage } from './pages/HomePage';
import { usePage } from './hooks/usePage';
import { useEffect, useState } from 'react';
import { sendToDevvit } from './utils';
import { useDevvitListener } from './hooks/useDevvitListener';

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
  useEffect(() => {
    sendToDevvit({ type: 'INIT' });
  }, []);

  useEffect(() => {
    if (initData) {
      setPostId(initData.postId);
    }
  }, [initData, setPostId]);

  return <div>{getPage(page, { postId })}</div>;
};
