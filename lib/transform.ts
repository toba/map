import { is, Header, HttpStatus } from '@toba/tools';
import { log } from '@toba/logger';
import { MapProperties, MapDataType } from './types';
import { config, kml, geoJSON } from './';
import fetch from 'node-fetch';
import { FeatureCollection, GeometryObject } from 'geojson';

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

export async function load(url: string): Promise<Buffer | void> {
   const reply = await fetch(url, {
      headers: { [Header.UserAgent]: 'node.js' }
   });

   return reply.status !== HttpStatus.OK
      ? log.error(`Attempt to GET ${url} returned ${reply.status}`)
      : reply.buffer();
}

export async function loadSource(
   key: string
): Promise<FeatureCollection<GeometryObject>> {
   const s = config.source[key];
   const data = await load(s.url);

   if (is.value(data)) {
      switch (s.type) {
         case MapDataType.GeoJSON:
         case MapDataType.KML:
            log.error(`Unsupported map source ${s.type} at ${s.url}`);
            return null;
         case MapDataType.KMZ:
         default:
            const doc = await kml.fromKMZ(data);
            return geoJSON.featuresFromKML(doc, s.transform);
      }
   }
}
