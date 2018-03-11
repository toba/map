import { is } from '@toba/tools';

/**
 * Node content.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
 */
function value(node: Element | Node | Document): string {
   if (is.value(node) && node.normalize) {
      node.normalize();
   }
   return node && node.firstChild && node.firstChild.nodeValue;
}

function firstValue(node: Element | Document, tag: string): string {
   return value(firstNode(node, tag));
}

/**
 * First child or null.
 */
function firstNode(node: Element | Document, tag: string): Element {
   const n = node.getElementsByTagName(tag);
   return is.value(n) && n.length > 0 ? n[0] : null;
}

const numberAttribute = (dom: Element, name: string) =>
   parseFloat(dom.getAttribute(name));

export const xml = { value, firstValue, firstNode, numberAttribute };
