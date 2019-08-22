import { parse } from 'url';
import * as path from 'path';
import { mockFetch } from '@toba/test';

const fetch = mockFetch(url => {
   const link = parse(url.toString(), true);

   if (link.path === undefined) {
      return __dirname;
   }
   const parts = link.path.split('/');
   const fileName = parts.length > 0 ? parts[parts.length - 1] : link.path;
   return fileName === undefined ? __dirname : path.join(__dirname, fileName);
});

export default fetch;
