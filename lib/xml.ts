import { is } from '@toba/tools';

/**
 * Node content.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
 */
function value(node: Element | Node | Document | null): string | null {
   if (is.value(node) && node.normalize) {
      node.normalize();
   }
   return node && node.firstChild && node.firstChild.nodeValue;
}

function firstValue(node: Element | Document, tag: string): string | null {
   return value(firstNode(node, tag));
}

/**
 * First child or null.
 */
function firstNode(node: Element | Document, tag: string): Element | null {
   const n = node.getElementsByTagName(tag);
   return is.value(n) && n.length > 0 ? n[0] : null;
}

const numberAttribute = (dom: Element, name: string) => {
   const num = dom.getAttribute(name);
   return num !== null ? parseFloat(num) : 0;
};

export const xml = { value, firstValue, firstNode, numberAttribute };
