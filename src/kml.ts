import JSZip from 'jszip'
import { is, maybeNumber, titleCase, MimeType } from '@toba/tools'
import { DOMParser, Options } from 'xmldom'
import { MapProperties, Index } from './types'
import { xml } from './xml'

const xmlConfig: Options = {
   locator: {},
   errorHandler: {
      warning: () => {},
      error: console.error,
      fatalError: console.error
   }
}

/**
 * Curry function to convert string to number rounded to a number of places.
 */
const roundFromString = (places: number) => (n: string) =>
   parseFloat(parseFloat(n).toFixed(places))

/**
 * Coordinate values for one or more segments. In KML these are
 * space-separated, comma-delimited points.
 *
 * @example
 *
 *    -113.2924677415256,44.70498119901985,0 -113.2924051073907,44.70509329841001,0 -113.2922923580428,44.70527906358436,0
 */
function coordinates(node: Element, name: string): number[][][] | null {
   const lines = node.getElementsByTagName(name)

   if (lines != null && lines.length > 0) {
      const segments: number[][][] = []

      for (let i = 0; i < lines.length; i++) {
         const coordinates = xml.firstValue(lines[i], 'coordinates')
         if (coordinates != null) {
            const locations: number[][] = []
            const points = coordinates.trim().split(' ')

            points.forEach(p => {
               const location: number[] = []
               const parts = p.split(',').map(roundFromString(6))

               if (parts.length >= 2) {
                  location[Index.Longitude] = parts[0]
                  location[Index.Latitude] = parts[1]
                  if (parts.length >= 3) location[Index.Elevation] = parts[2]

                  locations.push(location)
               }
            })
            if (locations.length > 0) segments.push(locations)
         }
      }
      if (segments.length > 0) return segments
   }
   return null
}

/**
 * Return location as `[latitude, longitude, elevation]` or null if the element
 * contains no coordinates.
 */
function location(node: Element): number[] | null {
   const locations = coordinates(node, 'Point')
   if (locations != null && locations.length > 0) {
      // TODO this seems wrong
      return locations.length > 1 ? locations[0][0] : locations[0][0]
   }
   return null
}

/**
 * Get array of segments (which are arrays of point arrays) or null if the
 * element contains no coordinates.
 */
function line(node: Element): number[][][] | null {
   const l = coordinates(node, 'LineString')
   return l == null || l.length == 0 ? null : l
}

/**
 * Remove cruft from XML CDATA.
 */
const clean = (text: string | null) =>
   is.value<string>(text)
      ? text
           .replace(/[\r\n]/g, '')
           .replace('&lt;Null&gt;', '')
           .replace('<Null>', '')
      : null

/**
 * Extract properties from description HTML table. This seems to be standard
 * output format from ESRI systems.
 */
function parseDescription(
   properties: Partial<MapProperties>
): Partial<MapProperties> | null {
   if (
      is.defined(properties, 'description') &&
      /<html/.test(properties.description!)
   ) {
      // remove CDATA wrapper
      const source = properties
         .description!.replace(/^<!\[CDATA\[/, '')
         .replace(/\]\]>$/, '')
      let html: Document | null = null

      try {
         html = new DOMParser(xmlConfig).parseFromString(source, MimeType.XML)
      } catch (ex) {
         return properties
      }

      const tables = html.getElementsByTagName('table')

      let most = 0
      let index = -1

      // find index of the largest table
      for (let i = 0; i < tables.length; i++) {
         const t = tables[i]
         if (t.childNodes.length > most) {
            most = t.childNodes.length
            index = i
         }
      }

      if (index > 0) {
         const rows = tables[index].getElementsByTagName('tr')
         for (let i = 0; i < rows.length; i++) {
            const cols = rows[i].getElementsByTagName('td')
            const key = clean(xml.value(cols[0]))
            const value = maybeNumber(clean(xml.value(cols[1])))

            if (key !== null && value !== null) {
               properties[key.replace(' ', '_')] = value
            }
         }
         // eslint-disable-next-line
         delete properties['description']
      }
   }
   return properties
}

/**
 * Return KML from KMZ file. Returns the first .kml file found in the archive
 * which should be doc.kml.
 */
async function fromKMZ(data: Buffer): Promise<Document | null> {
   const zip = new JSZip()
   const archive = await zip.loadAsync(data)
   // eslint-disable-next-line
   for (const name in archive.files) {
      if (name.endsWith('.kml')) {
         // eslint-disable-next-line
         const text = await archive.files[name].async('text')
         return new DOMParser(xmlConfig).parseFromString(text, MimeType.XML)
      }
   }
   return null
}

/**
 * Properties of a KML node.
 */
function properties(
   node: Element,
   extras: string[] = []
): Partial<MapProperties> | null {
   const names = extras.concat(['name', 'description'])
   const properties: Partial<MapProperties> = {}

   // eslint-disable-next-line
   for (const key of names) {
      let value = xml.firstValue(node, key)
      if (!is.empty(value)) {
         switch (key) {
            case 'name':
               value = titleCase(value!)
               break
            case 'description':
               value = value!.replace(/[\n\r]/g, ' ').replace(/\s{2,}/g, ' ')
               break
            default:
               break
         }
         properties[key] = maybeNumber(value)!
      }
   }
   return parseDescription(properties)
   //delete properties['description'];
}

export const kml = {
   fromKMZ,
   location,
   line,
   coordinates,
   properties,
   parseDescription
}
