import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { sailsVegi } from '../api/interfaces/iSails';

declare var sails: sailsVegi;

type GoogleMapsGetLocationInput = {
  addressLineOne: string;
  addressLineTwo: string;
  addressTownCity: string;
  addressPostCode: string;
  addressCountryCode: string;
};

export type Coordinate = {
  lat: number;
  lng: number;
};

/**
 * GoogleMapsApi
 * Class to load google maps api with api key
 * and global Callback to init map after resolution of promise.
 *
 * @exports {GoogleMapsApi}
 * @example MapApi = new GoogleMapsApi();
 *          MapApi.load().then(() => {});
 */

interface IGoogleMapsApi {
  // constructor(unusedApiKey: string): IGoogleMapsApi;
  constructor: Function;
  // load(): Promise<undefined>;
  // initMap(): void;

  // mapLoaded: boolean;
}

// declare var window: Window &
//   typeof globalThis & {
//     _GoogleMapsApi: IGoogleMapsApi;
//   };

class GoogleMapsApi implements IGoogleMapsApi {
  /**
   * Constructor
   * @property {string} apiKey
   */
  constructor(gApiKey: string, sails: sailsVegi) {
    this.apiKey = gApiKey;
    this.sails = sails;

    // if (!window._GoogleMapsApi) {
    //   this.callbackName = '_GoogleMapsApi.mapLoaded';
    //   window._GoogleMapsApi = this;
    //   window._GoogleMapsApi.mapLoaded = (this.mapLoaded as any).bind(this);
    // }
    const instance = axios.create({
      baseURL: sails.config.custom.googleApiBaseUrl,
      timeout: 2000,
      // headers: { Authorization: 'Basic ' + sails.config.custom.peeplAPIKey },
    });
    this.client = instance;

    const sessionToken = uuidv4(); //TODO: Should sessions live longer than one helper function call?

    this.baseQueryParameters = {
      // key: sails.config.custom.placesApiKey,
      key: sails.config.custom.distancesApiKey, //TODO: use Hussains api key above
      sessionToken: sessionToken,
    };
  }

  private apiKey: string;
  private sails: sailsVegi;
  private client: AxiosInstance;
  private baseQueryParameters: {
    key: string;
    sessionToken: string;
  };
  private callbackName: string;
  public mapLoaded: boolean;
  private promise: Promise<any>;
  private resolve: (unusedValue: any) => void;

  async getGeoLocation(inputs: GoogleMapsGetLocationInput) {
    var queryParameters = {
      ...this.baseQueryParameters,
      ...{
        fields: 'geometry',
        input: `${inputs.addressLineOne}, ${inputs.addressLineTwo}, ${inputs.addressTownCity}, ${inputs.addressPostCode}, ${inputs.addressCountryCode}`,
        inputtype: 'textquery',
        language: 'en',
        components: 'country:gb',
      },
    };

    try {
      sails.log(
        `MAPS API GET: ${sails.config.custom.googleApiBaseUrl}${sails.config.custom.placesApiRelUrlFindPlace}`
      );
      const response = await this.client.get(
        sails.config.custom.placesApiRelUrlFindPlace,
        {
          params: queryParameters,
        }
      );

      if (response.status === 200) {
        if (response.data.status !== 'OK'){
          sails.log.error(response.data.error_message);
          return null;
        }
        if (
          !Array.isArray(response.data['candidates']) ||
          response.data['candidates'].length < 1
        ) {
          return null;
        }
        const firstCoordinates: { lat: number; lng: number } =
          response.data['candidates'][0]['geometry']['location'];
        return firstCoordinates;
      }
    } catch (err) {
      sails.log.error(err);
      return null;
    }
  }

  async getDistanceBetweenPlaces(
    vendorOrigin: Coordinate,
    deliveryDestination: Coordinate
  ): Promise<null|number> {
    var validTravelModes = ['driving', 'walking', 'bicycling', 'transit'];
    var validUnits = ['metric', 'imperial'];
    var validRestrictions = ['tolls', 'highways', 'ferries', 'indoor'];
    var validTrafficModel = ['best_guess', 'pessimistic', 'optimistic'];
    var validTransitMode = ['bus', 'subway', 'train', 'tram', 'rail'];
    var validTransitRoutingPreference = ['less_walking', 'fewer_transfers'];
    // ~ https://github.com/ecteodoro/google-distance-matrix/blob/24a0ed3f2b6d804ca945d988020489cbb292e928/index.js#L25
    // ~ https://github.com/ecteodoro/google-distance-matrix
    const origins = [vendorOrigin];
    const destinations = [deliveryDestination];
    var queryParameters = {
      ...this.baseQueryParameters,
      ...{
        origins: origins,
        destinations: destinations,
        mode: 'driving',
        units: 'metric',
        language: 'en',
        avoid: null,
      },
    };
    try {
      sails.log(
        `MAPS API GET: ${sails.config.custom.googleApiBaseUrl}${sails.config.custom.distancesApiRelUrlGetDistance}`
      );
      const response = await this.client.get(
        sails.config.custom.distancesApiRelUrlGetDistance,
        {
          params: queryParameters,
        }
      );

      if (response.status === 200) {
        const distances = response.data;

        const rows = distances.rows.map((row, originInd) => {
          return row.elements.map((element, destInd) => {
            return {
              ...element,
              origin: origins[originInd],
              destination: destinations[destInd],
            };
          });
        });

        if (!rows || rows.length < 1 || rows[0].length < 1) {
          return null;
        }

        const metrics = rows[0][0];

        if (metrics.status !== 'OK'){
          return null;
        }

        return metrics.distance.value;
      }
    } catch (err) {
      sails.log.error(err);
      return null;
    }
  }

  // /**
  //  * Load
  //  * Create script element with google maps
  //  * api url, containing api key and callback for
  //  * map init.
  //  * @return {promise}
  //  * @this {_GoogleMapsApi}
  //  */
  // async load() {
  //   if (!this.promise) {
  //     this.promise = new Promise((resolve) => {
  //       this.resolve = resolve;

  //       if (typeof window.google === 'undefined') {
  //         const script = document.createElement('script');
  //         script.src = `//maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=${this.callbackName}`;
  //         script.async = true;
  //         document.body.append(script);
  //       }
  //       this.resolve(undefined);
  //     });
  //   }

  //   return this.promise;
  // }

  // /**
  //  * initMap
  //  * Global callback for loaded/resolved map instance.
  //  * @this {_GoogleMapsApi}
  //  */
  // initMap() {
  //   if (this.resolve) {
  //     this.resolve(undefined);
  //   }
  // }
}

export default GoogleMapsApi;
