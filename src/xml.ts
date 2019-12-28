import { is } from '@toba/tools';
import { DOMParser as DOM } from 'xmldom';

const fromText = (text: string) => new DOM().parseFromString(text);

/**
 * Node content.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
 */
function value(node: Element | Node | Document | null): string | null {
   if (is.value<Document | Node | Element>(node) && node.normalize) {
      node.normalize();
   }
   return node && node.firstChild && node.firstChild.nodeValue;
}

/**
 * First child or null.
 */
function firstNode(node: Element | Document, tag: string): Element | null {
   const n = node.getElementsByTagName(tag);
   return is.value(n) && n.length > 0 ? n[0] : null;
}

const firstValue = (el: Element | Document, tag: string) =>
   value(firstNode(el, tag));

const parseAttribute = <T>(parser: (v: string) => T, fallback?: T) => (
   el: Element,
   name: string,
   ifNull: T | undefined = fallback
): T | undefined => {
   const v = el.getAttribute(name);
   return v !== null ? parser(v) : ifNull;
};

export const xml = {
   value,
   firstValue,
   firstNode,
   fromText,
   /** Convert attribute value to type */
   attr: {
      asFloat: parseAttribute<number>(v => parseFloat(v)),
      asBoolean: parseAttribute<boolean>(v => v == 'true', false),
      asInteger: parseAttribute<number>(v => parseInt(v, 10)),
      asText: parseAttribute<string>(v => v)
   }
};
