import * as path from 'path';
import { readFile as testRead, readFileText as testReadText } from '@toba/test';

const mockPath = (fileName: string) => path.join(__dirname, fileName);

export const readFile = (fileName: string) => testRead(mockPath(fileName));
export const readFileText = (fileName: string) =>
   testReadText(mockPath(fileName));
