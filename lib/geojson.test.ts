import '@toba/test';
import { geoJSON, kml } from '../index';
import { readFile, readFileText } from './__mocks__/read';
import {
   mines as transformMines,
   trails as transformTrails
} from './__mocks__/transform';

beforeAll(() => {
   console.warn = jest.fn();
});

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
   const mines = readFile('mines.kmz')
      .then(kml.fromKMZ)
      .then(geoJSON.featuresFromKML(transformMines))
      .then(geo => {
         expect(geo).toBeDefined();
         expect(geo).toHaveProperty('type', geoJSON.Type.Collection);
         expect(geo).toHaveProperty('features');
         expect(geo.features).toBeInstanceOf(Array);
         expect(geo.features).toHaveLength(8843);
         expect(geo.features[0]).toHaveProperty('properties');
         expect(geo.features[0].properties).toHaveProperty(
            'Land Owner',
            'U.S. Forest Service'
         );
         expect(geo.features[0].geometry).toHaveProperty(
            'type',
            geoJSON.Type.Point
         );
      });

   const bikeTrails = readFile('bicycle.kmz')
      .then(kml.fromKMZ)
      .then(geoJSON.featuresFromKML(transformTrails))
      .then(geo => {
         expect(geo).toBeDefined();
         expect(geo).toHaveProperty('type', geoJSON.Type.Collection);
         expect(geo.features).toHaveLength(2444);
         expect(geo.features[0].properties).toHaveProperty(
            'Label',
            'Wonderpup'
         );
         expect(geo.features[0].geometry).toHaveProperty(
            'type',
            geoJSON.Type.Line
         );
      });

   return Promise.all([mines, bikeTrails]);
});
