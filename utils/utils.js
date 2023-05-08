import he from 'he';
import { visit } from 'unist-util-visit';

export function decodeEntitiesPlugin() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      node.value = he.decode(node.value);
    });
  };
}
