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

function firstValue(el: Element | Document, tag: string): string | null {
   return value(firstNode(el, tag));
}

const parseAttribute = <T>(parser: (v: string) => T, fallback?: T) => (
   el: Element,
   name: string,
   ifNull: T | undefined = fallback
) => {
   const v = el.getAttribute(name);
   return v !== null ? parser(v) : ifNull;
};

const floatAttribute = parseAttribute<number>(v => parseFloat(v), 0.0);
const integerAttribute = parseAttribute<number>(v => parseInt(v, 10), 0);
const booleanAttribute = parseAttribute<boolean>(v => v == 'true', false);
const textAttribute = parseAttribute<string>(v => v);

export const xml = {
   value,
   firstValue,
   firstNode,
   fromText,
   /** Convert attribute value to type */
   attr: {
      asFloat: floatAttribute,
      asBoolean: booleanAttribute,
      asInteger: integerAttribute,
      asText: textAttribute
   }
};
