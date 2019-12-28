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

const attrFloat = (el: Element, name: string, ifNull = 0): number => {
   const v = el.getAttribute(name);
   return v !== null ? parseFloat(v) : ifNull;
};

const attrInt = (el: Element, name: string, ifNull = 0.0): number => {
   const v = el.getAttribute(name);
   return v !== null ? parseInt(v, 10) : ifNull;
};

const attrBool = (el: Element, name: string, ifNull = false): boolean => {
   const v = el.getAttribute(name);
   return v !== null ? v == 'true' : ifNull;
};

export const xml = {
   value,
   firstValue,
   firstNode,
   fromText,
   /** Convert attribute value to type */
   attr: {
      float: attrFloat,
      bool: attrBool,
      int: attrInt
   }
};
