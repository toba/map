import '@toba/test';
import { Duration } from '@toba/tools';
import { measure } from '.';

function expectGeoPoint(point: number[]): number[] {
   expect(point).toBeInstanceOf(Array);
   expect(point[0]).toBeWithin(-180, 180);
   expect(point[1]).toBeWithin(-90, 90);
   return point;
}

test('converts between degrees and radians', () => {
   expect(measure.toRadians(48)).toBeWithin(0.8, 0.9);
   expect(measure.toRadians(-122)).toBeWithin(-2.2, -2.1);
});

test('calculates distance between points', () => {
   const p1 = expectGeoPoint([-122.0, 48.0]);
   const p2 = expectGeoPoint([-121.0, 49.0]);

   expect(measure.pointDistance(p1, p2)).toBeWithin(82, 83);

   const p3 = expectGeoPoint([-118.4081, 33.9425]);
   const p4 = expectGeoPoint([-156.4305, 20.8987]);

   expect(measure.pointDistance(p3, p4)).toBeWithin(2482, 2483);
});

test('calculates distance between coordinates', () => {
   expect(measure.distance(-122.0, 48.0, -122.0, 48.0)).toBe(0);
   expect(measure.distance(48.0, -122.0, 49.0, -121.0)).toBeWithin(82, 83);
   expect(measure.distance(33.9425, -118.4081, 20.8987, -156.4305)).toBeWithin(
      2482,
      2483
   );
});

test('calculates distance between lat/lon tuples', () => {
   expect(measure.distanceLatLon([-122.0, 48.0], [-122.0, 48.0])).toBe(0);
   expect(measure.distanceLatLon([48.0, -122.0], [49.0, -121.0])).toBeWithin(
      82,
      83
   );
   expect(
      measure.distanceLatLon([33.9425, -118.4081], [20.8987, -156.4305])
   ).toBeWithin(2482, 2483);
});

test('identifies points at the same location', () => {
   const p1 = expectGeoPoint([100, 50, 20]);
   const p2 = expectGeoPoint([100, 50, 30]);
   const p3 = expectGeoPoint([100, 51, 30]);

   expect(measure.sameLocation(p1, p2)).toBe(true);
   expect(measure.sameLocation(p1, p3)).toBe(false);
});

test('calculates speed between two points', () => {
   const p1 = expectGeoPoint([-122, 48, 0, 100]);
   const p2 = expectGeoPoint([-120, 50, 0, 100 + Duration.Hour]);

   expect(measure.speed(p1, p2)).toBeWithin(165, 166);
});

test('calculates distance between points', () => {
   const points = [
      expectGeoPoint([-122, 48]),
      expectGeoPoint([-121, 49]),
      expectGeoPoint([-120, 50])
   ];
   expect(measure.length(points)).toBeWithin(165, 166);
});
