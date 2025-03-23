import { useEffect, useState } from 'react';
import HorizontalTree from '../graphs/HorizontalTree';
import { sendToDevvit } from '../utils';
import { SubredditNode } from '../shared';

export const HomePage = ({ postId }: { postId: string }) => {
  const [subredditPath, setSubredditPath] = useState<SubredditNode>({
    name: 'start',
    children: [],
  });

  const [currentSubredditNode, setCurrentSubredditNode] = useState<SubredditNode | null>(null);

  const handleDiscoverSubreddit = (subreddit: string) => {
    sendToDevvit({
      type: 'DISCOVER_SUBREDDIT',
      payload: { subreddit, previousSubreddit: currentSubredditNode?.name || 'start' },
    });

    setSubredditPath((prev: SubredditNode) => {
      const updatedPath = { ...prev };
      let currentNode = currentSubredditNode || updatedPath;

      // traverse and add the new subreddit as child to the curr node
      const existingNode = currentNode.children.find(
        (child: SubredditNode) => child.name === subreddit
      );

      if (!existingNode) {
        const newSubredditNode: SubredditNode = { name: subreddit, children: [] };
        currentNode.children.push(newSubredditNode);
        currentNode = newSubredditNode; // move to newly added node
      } else {
        currentNode = existingNode; // move to existing node
      }

      setCurrentSubredditNode(currentNode); // update curr node

      return updatedPath;
    });
  };

  useEffect(() => {
    console.log(subredditPath);
  }, [subredditPath]);

  return (
    <div>
      <p>PostId: {postId}</p>

      <button onClick={() => handleDiscoverSubreddit('javascript')}>Go to r/javascript</button>
      <button onClick={() => handleDiscoverSubreddit('reactjs')}>Go to r/reactjs</button>
      <button onClick={() => handleDiscoverSubreddit('frontend')}>Go to r/frontend</button>

      <HorizontalTree data={subredditPath} />
    </div>
  );
};
