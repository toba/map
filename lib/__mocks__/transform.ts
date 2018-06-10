import { MapProperties } from '../types';
import { is, titleCase } from '@toba/tools';
import { relabel } from '../transform';

const vehicle: { [key: string]: string } = {
   ATV: 'ATV',
   AUTOMOBILE: 'Automobile',
   JEEP: 'Jeep',
   MOTORCYCLE: 'Motorcycle',
   UTV: 'UTV'
};

/**
 * Update seasonal restriction field.
 */
function seasonal(
   vehicleKey: string,
   from: MapProperties,
   out: MapProperties
): void {
   if (is.defined(from, vehicleKey)) {
      out[vehicle[vehicleKey] + ' Allowed'] = from[vehicleKey];
   }
}

export function trails(from: MapProperties): MapProperties {
   const out: MapProperties = {};
   const miles: number = from['MILES'] as number;
   const who = 'Jurisdiction';
   let name: string = from['NAME'] as string;
   let label: string = from['name'] as string;

   if (miles && miles > 0) {
      out['Miles'] = miles;
   }
   if (is.value<string>(label)) {
      label = label.trim();
   }

   if (!is.empty(name) && !is.empty(label)) {
      name = titleCase(name.trim());
      // label is usually just a number so prefer name when supplied
      const num = label.replace(/\D/g, '');
      // some names alread include the road or trail number and
      // some have long numbers that aren't helpful
      label =
         (num.length > 1 && name.includes(num)) || num.length > 3
            ? name
            : name + ' ' + label;
   }

   if (label) {
      out['Label'] = label;
   }

   Object.keys(vehicle).forEach(key => {
      seasonal(key, from, out);
   });

   relabel(from, out, { JURISDICTION: who });

   if (is.defined(out, who)) {
      out[who] = titleCase(out[who] as string);
   }

   return out;
}

export function mines(from: MapProperties): MapProperties {
   const out: MapProperties = {};
   // lowercase "name" is the county name
   relabel(from, out, {
      FSAgencyName: 'Forest Service Agency',
      LandOwner: 'Land Owner',
      DEPOSIT: 'Name',
      Mining_District: 'Mining District'
   });
   return out;
}
