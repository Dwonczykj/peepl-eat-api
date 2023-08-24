// import {
//   SailsModelType,
//   sailsVegi,
// } from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  VendorType,
  OmitIdRecursive
} from '../../../scripts/utils';
import HttpStatusCode from '../../interfaces/httpStatusCodes';

// declare var sails: sailsVegi;
// declare var Vendor: SailsModelType<VendorType>;


export type ViewCreateVendorInputs = {};

export type ViewCreateVendorResponse =
  | {
      vendor?: OmitIdRecursive<VendorType>;
      googleApiKey: string;
      userRole: string;
    }
  | false;

export type ViewCreateVendorExits = {
  success: (unusedData: ViewCreateVendorResponse) => any;
  successJSON: (
    unusedResponse: ViewCreateVendorResponse
  ) => ViewCreateVendorResponse;
  notFound: () => void;
  issue: (unusedErr: Error | String) => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  ViewCreateVendorInputs,
  ViewCreateVendorResponse,
  ViewCreateVendorExits
> = {
  friendlyName: 'View create vendor',

  description: 'Display "Create vendor" page.',

  inputs: {},

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/edit-vendor',
      statusCode: HttpStatusCode.OK,
    },
    successJSON: {
      statusCode: HttpStatusCode.OK,
    },
    notFound: {
      statusCode: HttpStatusCode.NOT_FOUND,
    },
    issue: {
      statusCode: HttpStatusCode.FORBIDDEN,
    },
    badRequest: {
      statusCode: HttpStatusCode.BAD_REQUEST,
      responseType: 'badRequest',
    },
    error: {
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
    },
  },

  fn: async function (
    inputs: ViewCreateVendorInputs,
    exits: ViewCreateVendorExits
  ) {
    // var createVendor: OmitIdRecursive<VendorType> = {
    //   name: '',
    //   type: 'shop',
    //   phoneNumber: '',
    //   costLevel: 0.0,
    //   rating: 0.0,
    //   isVegan: true,
    //   minimumOrderAmount: 0.0,
    //   platformFee: 0.0,
    //   status: 'draft',
    //   walletAddress: '0x',
    //   description: '',
    //   imageUrl: '',
    //   pickupAddress: {
    //     addressLineOne: '',
    //     addressLineTwo: '',
    //     addressTownCity: '',
    //     addressPostCode: '',
    //     addressCountryCode: '',
    //     latitude: 0.0,
    //     longitude: 0.0,
    //     label: '',
    //   },
    //   deliveryPartner: null,

    //   /// fulfilment method config for deliveries from the vendor
    //   deliveryFulfilmentMethod: null,

    //   /// fulfilment method config for collections from the vendor
    //   collectionFulfilmentMethod: null,

    //   /// the list of products in the vendor's inventory
    //   products: [],

    //   /// The categoric type of the vendor (i.e. a cafe).
    //   vendorCategories: [], // i.e. Cafes

    //   /// vendor specific categories to assign each of their products into
    //   productCategories: [],

    //   /// Postal Districts (Post Code Areas) that the vendor will allow customers from
    //   fulfilmentPostalDistricts: [],

    //   /// users registered to the vendor's organisation
    //   users: [],
    // };

    // Respond with view.
    // return exits.success({ vendor: createVendor });
    if (this.req.wantsJSON) {
      return exits.successJSON({
        googleApiKey: sails.config.custom.distancesApiKey,
        userRole: this.req.session.userRole,
      });
    } else {
      return exits.success({
        googleApiKey: sails.config.custom.distancesApiKey,
        userRole: this.req.session.userRole,
      });
    }
  },
};

module.exports = _exports;
