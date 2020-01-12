import { is } from '@toba/tools';
import { DOMParser } from 'xmldom';
import {
   GeometryObject,
   Feature,
   FeatureCollection,
   Point,
   LineString,
   MultiLineString
} from 'geojson';
import { Index, Transformer } from './types';
import { measure, gpx, kml } from './index';

export const enum GeoJsonType {
   Feature = 'Feature',
   FeatureCollection = 'FeatureCollection',
   Point = 'Point',
   MultiPoint = 'MultiPoint',
   Line = 'LineString',
   MultiLine = 'MultiLineString',
   Polygon = 'Polygon',
   MultiPolygon = 'MultiPolygon',
   GeometryCollection = 'GeometryCollection'
}

/**
 * Empty feature collection.
 */
const features = <T extends GeometryObject>(): FeatureCollection<T> => ({
   type: GeoJsonType.FeatureCollection,
   features: [] as Feature<T>[]
});

/**
 * Basic GeoJSON geometry may contain a single point (lat, lon array), an array
 * of points (line) or an array of lines.
 */
const geometry = (
   type: GeoJsonType,
   coordinates: number[] | number[][] | number[][][] | null
) =>
   ({
      type,
      coordinates
   } as GeometryObject);

/**
 * Convert GPX to GeoJSON with calculated speed and distance values.
 */
function trackFromGPX(
   node: Element,
   maxPossibleSpeed = 0
): Feature<LineString | MultiLineString> | null {
   let count = 0;
   let topSpeed = 0;
   let totalTime = 0;
   let totalSpeed = 0;
   let totalDistance = 0;

   const points = Array.from(node.getElementsByTagName('trkseg'))
      .map(segment => gpx.line(segment, 'trkpt'))
      .filter(line => line !== null && line[0].length > 0) as number[][][];

   const track = points.map(line => {
      totalTime += measure.duration(line);
      totalDistance += measure.length(line);

      return measure.simplify(
         line.map(point => {
            const speed = point[Index.Speed];

            if (maxPossibleSpeed === 0 || speed < maxPossibleSpeed) {
               count++;
               totalSpeed += speed;
               if (speed > topSpeed) {
                  topSpeed = parseFloat(speed.toFixed(1));
               }
            }
            return point.slice(0, 3);
         })
      );
   });

   return track.length === 0 || track[0].length === 0
      ? null
      : {
           type: GeoJsonType.Feature,
           properties: Object.assign(gpx.properties(node), {
              topSpeed,
              avgSpeed: parseFloat((totalSpeed / count).toFixed(1)),
              duration: totalTime,
              distance: parseFloat(totalDistance.toFixed(2))
           }),
           geometry:
              track.length === 1
                 ? (geometry(GeoJsonType.Line, track[0]) as LineString)
                 : (geometry(GeoJsonType.MultiLine, track) as MultiLineString)
        };
}

const routeFromGPX = (node: Element): Feature<LineString> => ({
   type: GeoJsonType.Feature,
   properties: gpx.properties(node),
   geometry: geometry(GeoJsonType.Line, gpx.line(node, 'rtept')) as LineString
});

const pointFromGPX = (node: Element): Feature<Point> => ({
   type: GeoJsonType.Feature,
   properties: gpx.properties(node, ['sym']),
   geometry: geometry(GeoJsonType.Point, gpx.location(node)) as Point
});

function pointFromKML(node: Element): Feature<Point> | null {
   const location = kml.location(node);
   return location == null
      ? null
      : {
           type: GeoJsonType.Feature,
           properties: kml.properties(node, ['sym']),
           geometry: geometry(GeoJsonType.Point, location) as Point
        };
}

const lineFeature = <T extends GeometryObject>(
   type: GeoJsonType,
   node: Element,
   lines: number[][] | number[][][]
): Feature<T> => ({
   type: GeoJsonType.Feature,
   properties: kml.properties(node),
   geometry: geometry(type, lines) as T
});

function lineFromKML(
   node: Element
): Feature<MultiLineString | LineString> | null {
   const lines = kml.line(node);
   return lines != null
      ? lines.length > 1
         ? lineFeature<MultiLineString>(GeoJsonType.MultiLine, node, lines)
         : lineFeature<LineString>(GeoJsonType.Line, node, lines[0])
      : null;
}

/**
 * Find nodes with a tag name and parse them into GeoJSON.
 *
 * @param name Name of tag to find
 */
const parseNodes = <T extends GeometryObject>(
   doc: Document,
   name: string,
   parser: (el: Element) => Feature<T> | null
): Feature<T>[] =>
   Array.from(doc.getElementsByTagName(name))
      .map(parser)
      .filter(f => is.value<Feature<T>>(f)) as Feature<T>[];

/**
 * Create GeoJSON from GPX string.
 *
 * @see http://geojson.org/geojson-spec.html
 * @see https://github.com/mapbox/togeojson
 */
function featuresFromGPX(gpxString: string): FeatureCollection<any> | null {
   const geo = features();
   let gpx = null;

   try {
      gpx = new DOMParser().parseFromString(gpxString);
   } catch (err) {
      console.error(err);
      return null;
   }
   const tracks = parseNodes(gpx, 'trk', trackFromGPX);
   const routes = parseNodes(gpx, 'rte', routeFromGPX);
   const points = parseNodes(gpx, 'wpt', pointFromGPX);

   geo.features = geo.features.concat(tracks, routes, points);

   return geo;
}

/**
 * Apply custom transformation to properties.
 */
function postProcess(
   features: Feature<any>[],
   transformer: Transformer | null = null
) {
   if (transformer !== null) {
      features.forEach(f => {
         f.properties = transformer(f.properties);
      });
   }
   return features;
}

/**
 * Convert KML to GeoJSON. KML places lines and points in the same `Placemark`
 * element, only differentiated by whether they have `Point` or `LineString`
 * members. The parse method will return null if the element doesn't contain
 * the expected geometry.
 *
 * @param transformer Optional post-processing method
 */
const featuresFromKML = (
   kml: string | Document | null,
   transformer: Transformer | null = null
) => {
   const geo = features();
   let doc: Document | null = null;

   if (is.text(kml)) {
      kml = kml.replace(/[\r\n]/g, '').replace(/>\s+</g, '><');

      try {
         doc = new DOMParser().parseFromString(kml);
      } catch (err) {
         console.error(err);
         return null;
      }
   } else {
      doc = kml;
   }

   if (doc !== null) {
      const lines = parseNodes(doc, 'Placemark', lineFromKML);
      const points = parseNodes(doc, 'Placemark', pointFromKML);

      geo.features = postProcess(
         geo.features.concat(lines, points),
         transformer
      );
   }

   return geo;
};

export const GeoJSON = {
   features,
   geometry,
   featuresFromGPX,
   featuresFromKML
};
