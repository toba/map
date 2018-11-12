import { GeoJsonProperties } from 'geojson';

export type TrackFeatures = GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;

export interface IMappable<T extends GeoJSON.GeometryObject> {
   geoJSON():
      | Promise<GeoJSON.Feature<T> | GeoJSON.FeatureCollection<T>>
      | GeoJSON.Feature<T>
      | GeoJSON.FeatureCollection<T>;
}

export enum MapDataType {
   KMZ,
   KML,
   GeoJSON
}

/**
 * Elements of a coordinate array in the order expected by Mapbox and Google
 * Maps.
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

/**
 * Remote map data to be displayed on the map.
 */
export interface MapSource {
   name: string;
   /** Name to show for attribution. */
   provider: string;
   /** Type of data file. The default is `KMZ`. */
   type?: MapDataType;
   url: string;
   /** Method to transform map data. */
   transform?: Transformer;
}

export interface MapProperties {
   [key: string]: string | number | undefined;
   description: string;
}

/**
 * Method to transform map properties.
 */
export type Transformer = (
   from: MapProperties | GeoJsonProperties | null
) => MapProperties | null;

/**
 * Mapbox compatible bounds in longitude, latitude order.
 *
 * @see https://www.mapbox.com/mapbox-gl-js/api/#lnglatboundslike
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
