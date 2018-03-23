import { geoJSON, kml } from '../index';
import { readFile, readFileText } from './__mocks__/read';

test('converts GPX files to GeoJSON', () => {
   return readFileText('track.gpx')
      .then(geoJSON.featuresFromGPX)
      .then(geo => {
         expect(geo).toBeDefined();
         expect(geo).toHaveProperty('type', geoJSON.Type.Collection);
         expect(geo).toHaveProperty('features');
         expect(geo.features).toBeInstanceOf(Array);
         expect(geo.features).toHaveLength(2);

         const first = geo.features[0];
         expect(first).toHaveAllProperties('geometry', 'properties');
         expect(first.geometry).toHaveProperty('type', geoJSON.Type.Line);
         expect(first.geometry).toHaveProperty('coordinates');
         expect(first.geometry.coordinates).toBeInstanceOf(Array);
         expect(first.geometry.coordinates).toHaveLength(23);
         expect(first.properties).toHaveProperty(
            'time',
            '2013-11-02T18:54:59Z'
         );

         //first.geometry.coordinates.forEach(expectGeoPoint);
      });
});

test('converts KML files to GeoJSON', () => {
   const first = readFile('mines.kmz')
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
      });

   const second = readFile('bicycle.kmz')
      .then(kml.fromKMZ)
      .then(geoJSON.featuresFromKML('Idaho Parks & Recreation'))
      .then(geo => {
         expect(geo).toBeDefined();
      });

   return Promise.all([first, second]);
});
