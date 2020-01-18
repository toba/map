import { is, merge } from '@toba/tools'
import { measure } from './index'
import { Index } from './types'
import { xml } from './xml'

export interface LocationConfig {
   checkPrivacy: boolean
   privacyCenter?: [number, number]
   privacyMiles: number
}

const defaultConfig: LocationConfig = {
   checkPrivacy: false,
   privacyMiles: 1
}

/**
 * Return location as [latitude, longitude, elevation, time, speed]
 * A degree of latitude is approximately 69 miles.
 * A degree of longitude is about 69 miles at the equater, 0 at the poles.
 *
 * @see http://nationalatlas.gov/articles/mapping/a_latlong.html
 */
function location(
   node: Element,
   config: LocationConfig | null = null
): number[] | null {
   const location = new Array(5)
   const elevation = xml.firstNode(node, 'ele') // meters
   const t = xml.firstNode(node, 'time') // UTC

   config = config === null ? defaultConfig : merge(config, defaultConfig)

   // WGS84 decimal degrees
   location[Index.Longitude] = xml.attr.asFloat(node, 'lon')
   location[Index.Latitude] = xml.attr.asFloat(node, 'lat')

   // exclude points close to home
   if (
      config.checkPrivacy &&
      measure.pointDistance(location, config.privacyCenter) <
         config.privacyMiles
   ) {
      return null
   }

   if (is.value(elevation)) {
      const v = xml.value(elevation)
      if (v !== null) {
         const m = parseFloat(v)
         // convert meters to whole feet
         location[Index.Elevation] = Math.round(m * 3.28084)
      }
   }

   if (is.value(t)) {
      const v = xml.value(t)
      if (v !== null) {
         const d = new Date(v)
         location[Index.Time] = d.getTime()
      }
   }
   // speed will be calculated later
   location[Index.Speed] = 0

   return location
}

/**
 * Properties of a GPX node
 */
function properties(
   node: Element,
   extras: string[] = []
): { [key: string]: string | number } {
   const names = extras.concat([
      'name',
      'desc',
      'author',
      'copyright',
      'link',
      'time',
      'keywords'
   ])
   const properties: { [key: string]: string } = {}

   // eslint-disable-next-line
   for (const key of names) {
      const value = xml.firstValue(node, key)
      if (!is.empty(value)) {
         properties[key] = value!
      }
   }
   return properties
}

/**
 * Get array of point arrays.
 */
const line = (node: Element, name: string): number[][] | null => {
   const points = Array.from(node.getElementsByTagName(name))
      .map(p => location(p))
      .filter(p => is.value(p)) as number[][]

   const speed = points.map((p, i, line) => {
      if (i > 0) p![Index.Speed] = measure.speed(p!, line[i - 1])
      return p!
   })

   return speed.length > 0 ? speed : null
}

export const gpx = { line, properties, location }
