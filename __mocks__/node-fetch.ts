import { parse } from 'url';
import * as path from 'path';
import { mockFetch } from '@toba/test';

const fetch = mockFetch(url => {
   const link = parse(url.toString(), true);
   const parts = link.path.split('/');
   const fileName = parts.length > 0 ? parts[parts.length - 1] : link.path;
   return path.join(__dirname, fileName);
});

export default fetch;
