import { Node } from "./shared";

export const findNode = (node: Node, id: string, type: string): Node | null => {
  if (node.id === id && node.type === type) return node;
  for (const child of node.children) {
    const found = findNode(child, id, type);
    if (found) return found;
  }
  return null;
};

export const insertNode = (root: Node, parent: Node, newNode: Node): Node => {
  const existingNode = findNode(root, newNode.id.toLowerCase(), newNode.type);
  if (existingNode) {
    parent.children.push({ ...newNode, isLeafDuplicate: true, children: [] });
    return existingNode;
  } else {
    parent.children.push(newNode);
    return newNode;
  }
};

export const calculateShortestDistance = (
  subredditPath: Node,
  startSubreddit: string,
  targetSubreddit: string
): number => {
  // Helper function to perform BFS (Breadth-First Search)
  const bfs = (root: Node, start: string, target: string): number => {
    const queue: { node: Node; distance: number }[] = [{ node: root, distance: 0 }];
    const visited = new Set<string>(); // Track visited nodes to avoid cycles

    while (queue.length > 0) {
      const { node, distance } = queue.shift()!; // Get the next node and its distance

      if (node.name.toLowerCase() === target.toLowerCase()) {
        return distance; // Found the target subreddit, return the distance
      }

      visited.add(node.id);

      // Add children nodes to the queue if not visited
      for (const child of node.children) {
        if (!visited.has(child.id)) {
          queue.push({ node: child, distance: distance + 1 });
        }
      }
    }

    return -1; // Return -1 if targetSubreddit is not found
  };

  return bfs(subredditPath, startSubreddit, targetSubreddit);
};
