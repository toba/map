import {
   Type,
   features,
   geometry,
   pointFromPhoto,
   featuresFromGPX,
   featuresFromKML
} from './lib/geojson';

import { properties, location, line } from './lib/gpx';

import {
   properties as kmlProperties,
   location as kmlLocation,
   line as kmlLine,
   fromKMZ,
   parseDescription
} from './lib/kml';

import {
   speed,
   length,
   centroid,
   duration,
   toRadians,
   sameLocation,
   pointDistance,
   simplify
} from './lib/measure';

export {} from './types';

export const measure = {
   speed,
   length,
   centroid,
   duration,
   toRadians,
   sameLocation,
   pointDistance,
   simplify
};

export const geoJSON = {
   Type,
   features,
   geometry,
   pointFromPhoto,
   featuresFromGPX,
   featuresFromKML
};

export const gpx = {
   properties,
   location,
   line
};

export const kml = {
   properties: kmlProperties,
   location: kmlLocation,
   line: kmlLine,
   fromKMZ,
   parseDescription
};
