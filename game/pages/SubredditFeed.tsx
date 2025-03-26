import React from 'react';
import PostPreview from '../components/PostPreview';
import { SubredditFeedProps } from '../shared';
import Markdown from 'markdown-to-jsx';

// testing click function
const printHelloWorld = (subredditName: string) => {
  console.log(`Hello from ${subredditName}`);
};

// convert the desc with subreddit mentions into an HTML string
const replaceSubredditWithLinks = (text: string) => {
  const regex = /r\/[a-zA-Z0-9_]+/g;
  return text.replace(regex, (match) => {
    const subredditName = match.slice(2); // remove 'r/'
    return `<a href="#" class="subreddit-button" data-subreddit="${subredditName}">${match}</a>`;
  });
};

const SubredditFeed: React.FC<SubredditFeedProps> = ({
  subredditName,
  subreddit,
  feedData,
  onItemClick,
}) => {
  const renderDescription = () => {
    const descriptionWithLinks = replaceSubredditWithLinks(subreddit.description);

    // HTML to JSX, and override <a> tags to render buttons
    return (
      <Markdown
        options={{
          disableAutoLink: true,
          overrides: {
            a: {
              component: ({ children, ...props }: any) => {
                const subredditName = props['data-subreddit']; // subreddit name from custom att
                return (
                  <button
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={() => printHelloWorld(subredditName)}
                  >
                    {children}
                  </button>
                );
              },
            },
          },
        }}
      >
        {descriptionWithLinks}
      </Markdown>
    );
  };

  return (
    <div>
      <h1>{subredditName}</h1>
      {renderDescription()}

      <p>Subscribers: {subreddit.subscribersCount}</p>
      <p>{subreddit.isNsfw ? 'NSFW' : 'SFW'}</p>
      <h2>Posts</h2>
      <ul>
        {feedData.map((post: any) => (
          <li key={post.postId}>
            <PostPreview post={post} onItemClick={onItemClick} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubredditFeed;
