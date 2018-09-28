import { Duration } from '@toba/tools';
import { Location, Index } from './types';

const piDeg = Math.PI / 180.0;
const radiusMiles = 3958.756;
//const radiusKm = 6371.0;
//const feetPerMeter = 3.28084;
const earthRadius = radiusMiles;
//let elevationConversion = feetPerMeter;

export enum Unit {
   English,
   Metric
}

/**
 * Total distance between all points
 */
const length = (points: number[][]) =>
   points.reduce(
      (total, p, i) => total + (i > 0 ? pointDistance(points[i - 1], p) : 0),
      0
   );

/**
 * Speed between two points
 */
function speed(p1: number[], p2: number[]): number {
   const t = Math.abs(p1[Index.Time] - p2[Index.Time]); // milliseconds
   const d = pointDistance(p1, p2);
   return t > 0 && d > 0 ? d / (t / Duration.Hour) : 0;
}

function duration(line: number[][]): number {
   const firstPoint = line[0];
   const lastPoint = line[line.length - 1];
   return (lastPoint[Index.Time] - firstPoint[Index.Time]) / Duration.Hour;
}

/**
 * Distance between geographic points accounting for earth curvature
 * South latitudes are negative, east longitudes are positive
 *
 * @see http://stackoverflow.com/questions/3694380/calculating-distance-between-two-points-using-latitude-longitude-what-am-i-doi
 * @see http://www.geodatasource.com/developers/javascript
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 * @see http://boulter.com/gps/distance/
 *
 *    Given φ is latitude radians, λ is longitude radians, R is earth radius:
 *    a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 *    c = 2 ⋅ atan2(√a, √(1−a))
 *    d = R ⋅ c
 */
function pointDistance(p1: number[], p2: number[]): number {
   if (sameLocation(p1, p2)) {
      return 0;
   }

   const radLat1 = toRadians(p1[Index.Latitude]);
   const radLat2 = toRadians(p2[Index.Latitude]);
   const latDistance = toRadians(p2[Index.Latitude] - p1[Index.Latitude]);
   const lonDistance = toRadians(p2[Index.Longitude] - p1[Index.Longitude]);
   const a =
      Math.pow(Math.sin(latDistance / 2), 2) +
      Math.cos(radLat1) *
         Math.cos(radLat2) *
         Math.pow(Math.sin(lonDistance / 2), 2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

   return earthRadius * c;
}

/**
 * Convert degrees to radians
 */
const toRadians = (deg: number) => deg * piDeg;

/**
 * Convert radians to degrees
 */
const toDegrees = (rad: number) => (rad * 180) / Math.PI;

/**
 * Shortest distance from a point to a segment defined by two points.
 */
function pointLineDistance(p: number[], p1: number[], p2: number[]): number {
   let x = p1[Index.Longitude];
   let y = p1[Index.Latitude];
   let Δx = p2[Index.Longitude] - x;
   let Δy = p2[Index.Latitude] - y;

   if (Δx !== 0 || Δy !== 0) {
      // non-zero distance
      const t =
         ((p[Index.Longitude] - x) * Δx + (p[Index.Latitude] - y) * Δy) /
         (Δx * Δx + Δy * Δy);

      if (t > 1) {
         x = p2[Index.Longitude];
         y = p2[Index.Latitude];
      } else if (t > 0) {
         x += Δx * t;
         y += Δy * t;
      }
   }

   Δx = p[Index.Longitude] - x;
   Δy = p[Index.Latitude] - y;

   return Δx * Δx + Δy * Δy;
}

/**
 * Find center of coordinates. Points are ordered as longitude, latitude.
 *
 * @see http://stackoverflow.com/questions/6671183/calculate-the-center-point-of-multiple-latitude-longitude-coordinate-pairs
 */
function centroid(points: number[][]): Location {
   const count = points.length;
   if (count == 0) {
      return null;
   }
   if (count == 1) {
      return {
         lon: points[0][Index.Longitude],
         lat: points[0][Index.Latitude]
      };
   }
   const location: Location = { lon: 0, lat: 0 };
   let x = 0;
   let y = 0;
   let z = 0;

   points.forEach(p => {
      const radLat = toRadians(p[Index.Latitude]);
      const radLon = toRadians(p[Index.Longitude]);
      x += Math.cos(radLat) * Math.cos(radLon);
      y += Math.cos(radLat) * Math.sin(radLon);
      z += Math.sin(radLat);
   });
   x /= count;
   y /= count;
   z /= count;

   const lon = Math.atan2(y, x);
   const hyp = Math.sqrt(x * x + y * y);
   const lat = Math.atan2(z, hyp);

   location.lat = toDegrees(lat);
   location.lon = toDegrees(lon);

   return location;
}

/**
 * Whether two points are at the same location (disregarding elevation)
 */
const sameLocation = (p1: number[], p2: number[]) =>
   p1[Index.Latitude] == p2[Index.Latitude] &&
   p1[Index.Longitude] == p2[Index.Longitude];

/**
 * Simplification using Douglas-Peucker algorithm with recursion elimination
 */
function simplify(
   points: number[][],
   maxPointDeviationFeet: number = 0
): number[][] {
   if (maxPointDeviationFeet <= 0) {
      return points;
   }

   const yard = 3;
   const mile = yard * 1760;
   const equatorFeet = mile * radiusMiles;

   const len = points.length;
   const keep = new Uint8Array(len);
   // convert tolerance in feet to tolerance in geographic degrees
   // TODO this is a percent, not degrees
   const tolerance = maxPointDeviationFeet / equatorFeet;
   let first = 0;
   let last = len - 1;
   const stack = [];
   let maxDistance = 0;
   let distance = 0;
   let index = 0;

   keep[first] = keep[last] = 1; // keep the end-points

   while (last) {
      maxDistance = 0;

      for (let i = first + 1; i < last; i++) {
         distance = pointLineDistance(points[i], points[first], points[last]);

         if (distance > maxDistance) {
            index = i;
            maxDistance = distance;
         }
      }
      if (maxDistance > tolerance) {
         keep[index] = 1; // keep the deviant point
         stack.push(first, index, index, last);
      }
      last = stack.pop();
      first = stack.pop();
   }
   return points.filter((_p, i) => keep[i] == 1);
}

export const measure = {
   speed,
   length,
   centroid,
   duration,
   toRadians,
   sameLocation,
   pointDistance,
   simplify
};
