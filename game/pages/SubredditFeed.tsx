import React, { useEffect } from 'react';
import PostPreview from '../components/PostPreview';
import { SubredditFeedProps } from '../shared';
import Markdown from 'markdown-to-jsx';

function formatSubscribersNumber(num: number): string {
  if (num < 1000) return num.toString();

  const suffixes = ['', 'k', 'M'];
  let tier = Math.floor(Math.log10(num) / 3);

  if (tier === 0) return num.toString();

  const scaled = num / Math.pow(10, tier * 3);
  const formatted = scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);

  return `${formatted}${suffixes[tier]}`;
}

// Function to convert the description with subreddit mentions into an HTML string
const replaceSubredditWithLinks = (text: string) => {
  // Replace r/subreddit mentions with <a> tags
  const regex = /r\/[a-zA-Z0-9_]+/g;
  return text.replace(regex, (match) => {
    const subredditName = match.slice(2); // Remove the "r/" part
    // Check if subredditName is valid (not undefined or empty)
    if (subredditName) {
      return ` <a href="#" class="subreddit-button" data-subreddit="${subredditName}">${match}</a> `;
    } else {
      // If subredditName is invalid, just return it as plain text or wrap it in a <span>
      return `<span>${match}</span>`;
    }
  });
};

// // Function to strip out all other <a> tags except those for subreddits
// const removeNonSubredditLinks = (html: string) => {
//   return html.replace(/<a [^>]*>(.*?)<\/a>/g, (match, content) => {
//     if (content.startsWith('r/')) {
//       // Keep the subreddit link if it starts with 'r/'
//       return match;
//     }
//     // Remove any other <a> tag
//     return '';
//   });
// };

const SubredditFeed: React.FC<SubredditFeedProps> = ({
  subredditName,
  subreddit,
  feedData,
  onItemClick,
  bannerImage,
  icon,
}) => {
  useEffect(() => {
    console.log(feedData);
  }, [feedData]);
  // Render description with subreddit mentions converted to <a> tags
  const renderDescription = () => {
    // Convert markdown to HTML and replace subreddit mentions with <a> tags
    if (!subreddit.description) {
      return null;
    }
    const descriptionWithLinks = replaceSubredditWithLinks(subreddit.description);

    // // Remove non-subreddit links (keep only those starting with 'r/')
    // const cleanedDescription = removeNonSubredditLinks(descriptionWithLinks);

    // Use markdown-to-jsx to convert HTML to JSX, and override <a> tags to render buttons
    return (
      <>
        <Markdown
          options={{
            disableAutoLink: true,
            overrides: {
              a: {
                component: ({ children, ...props }: any) => {
                  const subredditName = props['data-subreddit']; // Get subreddit name from custom attribute
                  if (!subredditName) {
                    return <span>{children}</span>;
                  }
                  return (
                    <button onClick={() => onItemClick('subreddit', subredditName, subredditName)}>
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
        {subreddit?.subscribersCount > 0 && (
          <p>Subscribers: {formatSubscribersNumber(subreddit.subscribersCount)}</p>
        )}
      </>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {bannerImage && (
        <div id="subreddit-banner-container">
          <img src={bannerImage} alt="Subreddit banner" />
        </div>
      )}

      <div id="subreddit-feed">
        <div id="subreddit-info">
          {/* Render the description with clickable buttons */}
          {renderDescription()}
        </div>

        <div id="subreddit-posts-container">
          <div id="subreddit-feed-name">
            {icon && (
              <img
                src={icon}
                alt="Subreddit icon"
                style={{ objectFit: 'cover', borderRadius: '50%', width: '100px' }}
              />
            )}
            <h1>r/{subredditName}</h1>
          </div>
          {feedData.map((post: any) => (
            <div key={post.postId}>
              {!post.nsfw && (
                <>
                  <hr />
                  <PostPreview post={post} onItemClick={onItemClick} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubredditFeed;
