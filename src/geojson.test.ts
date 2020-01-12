import '@toba/test';
import { GeoJSON, kml, GeoJsonType } from './index';
import {
   mines as transformMines,
   trails as transformTrails,
   readFile,
   readFileText
} from './.test-data';

beforeAll(() => {
   console.warn = jest.fn();
});

test('converts GPX files to GeoJSON', async () => {
   const geo = await readFileText('track.gpx').then(GeoJSON.featuresFromGPX);
   expect(geo).not.toBeNull();
   expect(geo).toHaveProperty('type', GeoJsonType.FeatureCollection);
   expect(geo).toHaveProperty('features');
   expect(geo!.features).toBeInstanceOf(Array);
   expect(geo!.features).toHaveLength(2);

   const first = geo!.features[0];
   expect(first).toHaveAllProperties('geometry', 'properties');
   expect(first.geometry).toHaveProperty('type', GeoJsonType.Line);
   expect(first.geometry).toHaveProperty('coordinates');
   expect(first.geometry.coordinates).toBeInstanceOf(Array);
   expect(first.geometry.coordinates).toHaveLength(23);
   expect(first.properties).toHaveProperty('time', '2013-11-02T18:54:59Z');
});

test('converts KML files to GeoJSON 1', async () => {
   //const kmz = await readFile('mines.kmz');
   const doc = await readFile('mines.kmz').then(kml.fromKMZ);
   const geo = GeoJSON.featuresFromKML(doc, transformMines);

   expect(geo).not.toBeNull();
   expect(geo).toHaveProperty('type', GeoJsonType.FeatureCollection);
   expect(geo).toHaveProperty('features');
   expect(geo!.features).toBeInstanceOf(Array);
   expect(geo!.features).toHaveLength(8843);
   expect(geo!.features[0]).toHaveProperty('properties');
   expect(geo!.features[0].properties).toHaveProperty(
      'Land Owner',
      'U.S. Forest Service'
   );
   expect(geo!.features[0].geometry).toHaveProperty('type', GeoJsonType.Point);
});

test('converts KML files to GeoJSON 2', async () => {
   const doc = await readFile('bicycle.kmz').then(kml.fromKMZ);
   const geo = GeoJSON.featuresFromKML(doc, transformTrails);

   expect(geo).toBeDefined();
   expect(geo).toHaveProperty('type', GeoJsonType.FeatureCollection);
   expect(geo!.features).toHaveLength(2444);
   expect(geo!.features[0].properties).toHaveProperty('Label', 'Wonderpup');
   expect(geo!.features[0].geometry).toHaveProperty('type', GeoJsonType.Line);
});
