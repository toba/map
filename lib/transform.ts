import { MapProperties } from './types';
import { is } from '@toba/tools';

/**
 * Copy labeled values to new labels to assist with map property transformation.
 */
export function relabel(
   from: MapProperties,
   out: MapProperties,
   labels: { [key: string]: string }
): void {
   Object.keys(labels).forEach(key => {
      if (is.defined(from, key)) {
         out[labels[key]] = from[key];
      }
   });
}
