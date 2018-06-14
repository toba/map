import { MapSource } from './';

export interface MapConfig {
   minimumTrackLength: number;
   minimumTrackPoints: number;
   /**
    * Distance a track point must deviate from others to avoid Douglas-Peucker
    * simplification.
    */
   maxPointDeviationFeet: number;
   /**
    * Manually adjusted tracks may have infinite speeds between points so throw
    * out anything over a threshold.
    */
   maxPossibleSpeed: number;
   /** Erase tracks around given latitude and longitude. */
   privacyCenter: number[];
   /** Radius around `privacyCenter` to exclude from GeoJSON */
   privacyMiles: number;
   /** Whether to enforce `privacy` settings */
   checkPrivacy: boolean;
   /** Whether track GPX files can be downloaded */
   allowDownload: boolean;
   /** Maximum number of photo markers to show on Mapbox static map */
   maxMarkers: number;
   /** Link patterns to external maps with `lat`, `lon`, `zoom` and `altitude` tokens */
   link: {[key: string]: string};
   source: { [key: string]: MapSource };
}

export const config: MapConfig = {
   minimumTrackLength: 0.2,
   minimumTrackPoints: 5,
   maxPointDeviationFeet: 0.5,
   maxPossibleSpeed: 150,
   privacyCenter: null,
   privacyMiles: 1,
   checkPrivacy: false,
   allowDownload: true,
   maxMarkers: 70,
   link: {
      googleEarth: 'https://earth.google.com/web/@{lat},{lon},1100a,{altitude}d,35y,0h,0t,0r';
      gaiaGPS: 'https://www.gaiagps.com/map/?layer=GaiaTopoRasterFeet&lat={lat}&lon={lon}&zoom={zoom}';
   },
   source: {}
};
