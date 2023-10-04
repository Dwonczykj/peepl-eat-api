import {
  SailsModelType,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  DiscountType,
  UserType
} from '../../../scripts/utils';
import { Currency } from '../../../api/interfaces/peeplPay';

declare var Discount: SailsModelType<DiscountType>;
declare var User: SailsModelType<UserType>;


export type CreateDiscountInputs = {
  code: string;
  value: number;
  currency: Currency;
  discountType: DiscountType['discountType'];
  expiryDateTime: DiscountType['expiryDateTime'];
  maxUses: number;
  isEnabled: boolean;
  linkedWalletAddress: string;
  vendor?: number | null;
};

export type CreateDiscountResponse = DiscountType | false;

export type CreateDiscountExits = {
  success: (unusedData: CreateDiscountResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
  duplicateCode: (unusedErr: Error | String) => void;
  fixedCodesNeedWalletAddress: (unusedErr: Error | String) => void;
  discountCodeTooShort: (unusedErr: Error | String) => void;
  notAuthorised: () => void;
};

const _exports: SailsActionDefnType<
  CreateDiscountInputs,
  CreateDiscountResponse,
  CreateDiscountExits
> = {
  friendlyName: 'CreateDiscount',

  inputs: {
    code: {
      type: 'string',
      required: true,
    },
    value: {
      type: 'number',
      required: true,
    },
    currency: {
      type: 'string',
      required: true,
    },
    discountType: {
      type: 'string',
      required: true,
    },
    expiryDateTime: {
      type: 'ref',
      required: true,
    },
    maxUses: {
      type: 'number',
      required: true,
    },
    isEnabled: {
      type: 'boolean',
      required: true,
    },
    linkedWalletAddress: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    vendor: {
      type: 'number',
      required: false,
      allowNull: true,
    },
  },

  exits: {
    success: {
      data: false,
    },
    notFound: {
      statusCode: 404,
    },
    issue: {
      statusCode: 400,
    },
    badRequest: {
      responseType: 'badRequest',
    },
    error: {
      statusCode: 500,
    },
    duplicateCode: {
      statusCode: 400,
    },
    fixedCodesNeedWalletAddress: {
      statusCode: 400,
    },
    discountCodeTooShort: {
      statusCode: 400,
    },
    notAuthorised: {
      statusCode: 401,
    },
  },

  fn: async function (
    inputs: CreateDiscountInputs,
    exits: CreateDiscountExits
  ) {
    let user = await User.findOne(this.req.session.userId);

    if (!user.isSuperAdmin) {
      return exits.notAuthorised();
      // inputs.vendor = user.vendor;
    }
    if(typeof(inputs.value) !== 'number'){
      sails.log(
        `Request contained a discount code value of "${
          inputs.value
        }" with type: ${typeof inputs.value}`
      );
      return exits.badRequest(`Request contained a discount code value of "${inputs.value}" with type: ${typeof(inputs.value)}`);
    }

    inputs.code = inputs.code.toUpperCase();

    if (inputs.code.length < 3) {
      return exits.discountCodeTooShort(
        'Discount codes must be at least 3 characters and ideally longer to avoid uniqueness errors'
      );
    }

    if (inputs.discountType === 'percentage') {
      const existingCodes = await Discount.find({
        code: inputs.code,
        isEnabled: true,
      });
      if (existingCodes && existingCodes.length > 0) {
        return exits.duplicateCode(
          'Percentage discount code already exists with that code'
        );
      }
    } else {
      if (inputs.linkedWalletAddress && inputs.vendor) {
        const existingCodes = await Discount.find({
          code: inputs.code,
          linkedWalletAddress: inputs.linkedWalletAddress,
          vendor: inputs.vendor,
          isEnabled: true,
          // expiryDateTime: { //TODO: Add expiry dates to filter
          //   'or':
          // }
        });
        if (existingCodes && existingCodes.length > 0) {
          return exits.duplicateCode(
            'Code already exists for that linked wallet address & vendor'
          );
        }
      } else if (inputs.linkedWalletAddress) {
        const existingCodes = await Discount.find({
          code: inputs.code,
          linkedWalletAddress: inputs.linkedWalletAddress,
          vendor: null,
          isEnabled: true,
        });
        if (existingCodes && existingCodes.length > 0) {
          return exits.duplicateCode(
            'Code already exists for that linked wallet address with null vendor'
          );
        }
      } // ! dont require a linkedWalletAddress as this stops us from registering to a  user later on.
    }
    try {
      const _newDiscount = await Discount.create({
        code: inputs.code,
        currency: inputs.currency,
        discountType: inputs.discountType,
        expiryDateTime: inputs.expiryDateTime,
        isEnabled: inputs.isEnabled,
        linkedWalletAddress: inputs.linkedWalletAddress,
        maxUses: inputs.discountType === 'fixed' ? 1 : inputs.maxUses,
        timesUsed: 0,
        value: inputs.value,
        vendor: inputs.vendor,
      })
        .fetch()
        .intercept('E_UNIQUE', 'duplicateCode');

      const newDiscount = await Discount.findOne(_newDiscount.id).populate(
        'vendor'
      );

      return exits.success(newDiscount);
    } catch (error) {
      return exits.error(error);
    }
  },
};

module.exports = _exports;
