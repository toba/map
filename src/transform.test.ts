import '@toba/test';
import { loadSource, config } from './index';
import { Type } from './geojson';

beforeAll(() => {
   config.source['mines'] = {
      name: '',
      provider: 'Idaho Geological Survey',
      url:
         'http://www.idahogeology.org/PDF/Digital_Data_(D)/Digital_Databases_(DD)/Mines_Prospects/2016/mines.kmz'
   };
});

test('load and transform remote KMZ', async () => {
   const geo = await loadSource('mines');
   expect(geo).not.toBeNull();
   expect(geo!.features).toHaveLength(8843);
   expect(geo!.type).toBe(Type.Collection);
});
