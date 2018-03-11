export enum MapDataType {
   KMZ,
   KML,
   GeoJSON
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

//= Duplicates from /src/client/browser.d.ts ==================================

/**
 * Standard response for administrative actions.
 */
export interface JsonResponse {
   success: boolean;
   message: string;
}

/**
 * GeoJSON properties for post photos.
 */
export interface MapPhoto {
   url?: string;
   title?: string;
   partKey?: string;
   /** Distance from clicked cluster */
   distance?: number;
}
