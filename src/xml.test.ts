import '@toba/test';
import { xml } from './xml';

const doc = xml.fromText(
   '<trkpt lat="43.238334" lon="-116.366600" id="45" visible="true">' +
      '<ele>926.90</ele>' +
      '<time>2013-11-02T18:54:59Z</time>' +
      '<fix>3d</fix>' +
      '</trkpt>'
);

test('returns first node of given type', () => {
   const node = xml.firstNode(doc, 'trkpt');
   expect(node).toBeDefined();
});

test('converts XML attributes to numbers', () => {
   const node = xml.firstNode(doc, 'trkpt');
   expect(node).not.toBeNull();
   expect(xml.attr.float(node!, 'lat')).toBe(43.238334);
   expect(xml.attr.float(node!, 'lon')).toBe(-116.3666);
   expect(xml.attr.bool(node!, 'visible')).toBe(true);
   expect(xml.attr.bool(node!, 'fake')).toBe(false);
   expect(xml.attr.int(node!, 'id')).toBe(45);
});

test('returns node content', () => {
   const node = xml.firstNode(doc, 'ele');
   expect(xml.value(node)).toBe('926.90');
});
