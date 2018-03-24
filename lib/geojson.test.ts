import '@toba/test';
import { readFile, readFileText } from '@toba/test';
import { geoJSON, kml } from '../index';

// function expectGeoPoint(point: number[]) {
//    expect(point).toBeInstanceOf(Array);
//    expect(point[0]).within(-180, 180);
//    expect(point[1]).within(-90, 90);
//    return point;
// }

test('converts GPX files to GeoJSON', () => {
   return readFileText('__mocks__/track.gpx')
      .then(geoJSON.featuresFromGPX)
      .then(geo => {
         expect(geo).toBeDefined();
         expect(geo).toHaveProperty('type', geoJSON.Type.Collection);
         expect(geo).toHaveProperty('features');
         expect(geo.features).toBeInstanceOf(Array);
         expect(geo.features).toHaveLength(4);

         const first = geo.features[0];
         expect(first).toHaveAllProperties('geometry', 'properties');
         expect(first.geometry).toHaveProperty('type', geoJSON.Type.Line);
         expect(first.geometry).toHaveProperty('coordinates');
         expect(first.geometry.coordinates).toBeInstanceOf(Array);
         expect(first.geometry.coordinates).toHaveLength(200);
         expect(first.properties).toHaveProperty(
            'time',
            '2014-05-18T19:56:51Z'
         );

         //first.geometry.coordinates.forEach(expectGeoPoint);
      });
});

test('converts KML files to GeoJSON', () =>
   Promise.all([
      readFile('__mocks__/mines.kmz')
         .then(kml.fromKMZ)
         .then(geoJSON.featuresFromKML('Idaho Geological Survey'))
         .then(geo => {
            expect(geo).toBeDefined();
            expect(geo).toHaveProperty('type', geoJSON.Type.Collection);
            expect(geo).toHaveProperty('features');
            expect(geo.features).toBeInstanceOf(Array);
            expect(geo.features).toHaveLength(8843);
            expect(geo.features[0]).toHaveProperty('properties');
            expect(geo.features[0].properties).toHaveProperty('DMSLAT', 443312);
         }),

      readFile('__mocks__/bicycle.kmz')
         .then(kml.fromKMZ)
         .then(geoJSON.featuresFromKML('Idaho Parks & Recreation'))
         .then(geo => {
            expect(geo).toBeDefined();
         })
   ]));
