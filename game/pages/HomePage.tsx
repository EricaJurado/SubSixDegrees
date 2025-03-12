import { ComponentProps } from 'react';
import { useSetPage } from '../hooks/usePage';

export const HomePage = ({ postId }: { postId: string }) => {
  const setPage = useSetPage();

  return (
    <div>
      <div />

      <h1>Welcome to Devvit</h1>
      <p>Let's build something awesome!</p>
      <p>PostId: {postId}</p>
      <MagicButton
        onClick={() => {
          setPage('pokemon');
        }}
      >
        Show me more
      </MagicButton>
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
