export enum MapDataType {
   KMZ,
   KML,
   GeoJSON
}

/**
 * Elements of a coordinate in the order expected by Mapbox and Google Maps
 */
export enum Index {
   Longitude,
   Latitude,
   Elevation,
   Time,
   Speed
}

export interface Location {
   lat: number;
   lon: number;
}

export interface MapSource {
   name: string;
   provider: string;
   type?: MapDataType;
   url: string;
}

export interface MapProperties {
   [key: string]: string | number;
   description?: string;
}

/**
 * Mapbox compatible bounds in longitude, latitude order.
 *
 * https://www.mapbox.com/mapbox-gl-js/api/#lnglatboundslike
 */
export interface MapBounds {
   /**
    * Southwest corner as lon, lat. For the U.S. this is the smallest
    * longitude and latitude values.
    */
   sw: number[];
   /**
    * Northeast corner as lon, lat. For the U.S. this is the largest
    * longitude and latitude values.
    */
   ne: number[];
}
