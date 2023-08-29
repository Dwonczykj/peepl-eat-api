import {
  AddressType,
  CategoryGroupType,
  DeliveryPartnerType,
  FulfilmentMethodType,
  PostalDistrictType,
  VendorType,
} from '../../../scripts/utils';
import { SailsModelType, sailsVegi } from '../../../api/interfaces/iSails';

declare var Vendor: SailsModelType<VendorType>;
declare var PostalDistrict: SailsModelType<PostalDistrictType>;
declare var DeliveryPartner: SailsModelType<DeliveryPartnerType>;
declare var CategoryGroup: SailsModelType<CategoryGroupType>;
declare var sails: sailsVegi;
module.exports = {
  friendlyName: 'View edit vendor',

  description: 'Display "Edit vendor" page.',

  inputs: {
    vendorid: {
      type: 'number',
    },
  },

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/edit-vendor',
    },
    successJSON: {
      statusCode: 200,
    },
  },

  fn: async function (inputs, exits) {
    var vendorid;
    let user = await User.findOne({ id: this.req.session.userId });
    
    if (user.isSuperAdmin && inputs.vendorid) {
      vendorid = inputs.vendorid;
    } else {
      vendorid = user.vendor;
    }

    const vendorHelperResult = await sails.helpers.selectVendorProducts.with({
      vendorId: vendorid,
    });
    if (!vendorHelperResult) {
      return exits.notFound('Vendor not found');
    }
    const vendor = vendorHelperResult.vendor;

    var delFulVendor = await Vendor.findOne(vendorid).populate(
      'deliveryFulfilmentMethod&deliveryFulfilmentMethod.openingHours&fulfilmentOrigin'
    );

    var colFulVendor = await Vendor.findOne(vendorid).populate(
      'collectionFulfilmentMethod&collectionFulfilmentMethod.openingHours&fulfilmentOrigin'
    );

    var vendorFulfilmentPostalDistricts = await Vendor.findOne(
      vendorid
    ).populate('fulfilmentPostalDistricts');

    // Get all postal districts
    var postalDistricts = await PostalDistrict.find();

    // set checked to true on postalDistricts that are also in vendorFulfilmentPostalDistricts
    postalDistricts.forEach((postalDistrict) => {
      var found = false;
      vendorFulfilmentPostalDistricts.fulfilmentPostalDistricts.forEach(
        (vendorPostalDistrict) => {
          if (vendorPostalDistrict.id === postalDistrict.id) {
            found = true;
          }
        }
      );
      if (found) {
        (postalDistrict as any).checked = true;
      }
    });

    const sortOpeningHours = (ful: FulfilmentMethodType) => {
      const days = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      if (ful && ful.openingHours) {
        const { openingHours, ...rest } = ful;
        ful = {
          ...rest,
          openingHours: ful.openingHours.sort(
            (a, b) =>
              days.indexOf(a.dayOfWeek.toLocaleLowerCase()) -
                days.indexOf(b.dayOfWeek.toLocaleLowerCase()) ||
              a.openTime.localeCompare(b.openTime) ||
              a.closeTime.localeCompare(b.closeTime)
          ),
        };
      }
      return ful;
    };
    var delFul = delFulVendor.deliveryFulfilmentMethod as FulfilmentMethodType;

    var colFul =
      colFulVendor.collectionFulfilmentMethod as FulfilmentMethodType;

    delFul = sortOpeningHours(delFul);
    colFul = sortOpeningHours(colFul);

    // Get a list of delivery partners
    var deliveryPartners = await DeliveryPartner.find({ status: 'active' });

    var categoryGroups = await CategoryGroup.find();

    if (!vendor.pickupAddress) {
      vendor.pickupAddress = {
        label: '',
        addressLineOne: '',
        addressLineTwo: '',
        addressTownCity: '',
        addressPostCode: '' as AddressType['addressPostCode'],
        addressCountryCode: '',
        latitude: null,
        longitude: null,
      } as AddressType;
    }
    if (!delFul.fulfilmentOrigin) {
      delFul.fulfilmentOrigin = {
        label: vendor.pickupAddress.label,
        addressLineOne: vendor.pickupAddress.addressLineOne,
        addressLineTwo: vendor.pickupAddress.addressLineTwo,
        addressTownCity: vendor.pickupAddress.addressTownCity,
        addressPostCode: vendor.pickupAddress.addressPostCode,
        addressCountryCode: vendor.pickupAddress.addressCountryCode,
        latitude: vendor.pickupAddress.latitude,
        longitude: vendor.pickupAddress.longitude,
      } as AddressType;
    }

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({
        vendor,
        delFul,
        colFul,
        postalDistricts,
        deliveryPartners,
        categoryGroups,
        googleApiKey: sails.config.custom.distancesApiKey,
        userRole: this.req.session.userRole,
      });
    } else {
      return exits.success({
        vendor,
        delFul,
        colFul,
        postalDistricts,
        deliveryPartners,
        categoryGroups,
        googleApiKey: sails.config.custom.distancesApiKey,
        userRole: this.req.session.userRole,
      });
    }
  },
};
