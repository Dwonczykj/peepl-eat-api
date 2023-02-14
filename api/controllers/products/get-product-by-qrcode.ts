import { SailsModelType, sailsVegi } from '../../interfaces/iSails';
import { ProductType } from '../../../scripts/utils';


declare var sails: sailsVegi;
declare var Product: SailsModelType<ProductType>;

type _GetProductFromQRcode = {
  qrCode: string;
  vendor?: number | null;
};

type _GetProductByQRCodeResponseType = ProductType;

const _exports = {
  friendlyName: 'Get product using qrcode',

  description:
    'End point to take consumer information for unregistered products on vegi that we should try and capture',

  inputs: {
    qrCode: {
      type: 'string',
      required: true,
      description: 'Barcode or QRCode Identifier for the product',
    },
    vendor: {
      type: 'number',
      required: false,
      allowNull: true,
    },
  },

  exits: {
    success: {
      data: null,
    },
    wrongVendor: {
      statusCode: 400,
    },
    notFound: {
      statusCode: 404,
    },
  },

  fn: async function (
    inputs: _GetProductFromQRcode,
    exits: {
      success: (
        unused: _GetProductByQRCodeResponseType
      ) => _GetProductByQRCodeResponseType;
      successJSON: (
        unused: _GetProductByQRCodeResponseType
      ) => _GetProductByQRCodeResponseType;
      wrongVendor: (unusedMessage: Error | string) => void;
      notFound: (unusedMessage: Error | string) => void;
    }
  ) {
    let GET_PRODUCTS_SQL;
    if(inputs.vendor){
      GET_PRODUCTS_SQL = `
SELECT p.id 
FROM vegi.productoption po 
left join vegi.productoptionvalue pov on pov.option = po.id 
join vegi.product p on p.id = po.product 
WHERE pov.productBarCode = $1 AND p.vendor = $2`;
    }else{
      GET_PRODUCTS_SQL = `
SELECT p.id 
FROM vegi.productoption po 
left join vegi.productoptionvalue pov on pov.option = po.id 
join vegi.product p on p.id = po.product 
WHERE pov.productBarCode = $1`;
    }

    // Send it to the database.
    const productIds = await sails.sendNativeQuery<{id: ProductType['id']}>(
      GET_PRODUCTS_SQL,
      inputs.vendor ? [inputs.qrCode, inputs.vendor] : [inputs.qrCode]
    );

    if (!productIds || !productIds.rows || productIds.rows.length < 1) {
      return exits.notFound('No Products with matching QRCode found');
    } else if (productIds.rows.length > 1){
      const issueMessage = `Multiple (${productIds.rows.length}) Items have the same QR Code of "${inputs.qrCode}" in the DB (with vendor id: [${inputs.vendor || 'null'}])`; 
      sails.log.warn(issueMessage);
      await sails.helpers.sendEmailToSupport.with({
        message: issueMessage,
        subject: `Warning - vegi server: Multiple products with same QRCode "${inputs.qrCode}"`,
      });
    }
    const firstRow = productIds.rows[0];
    const product = await Product
      .findOne({'id': firstRow.id})
      .populate('vendor&category&options'); 
    return exits.success(product);
  },
};

export type GetProductByQRCodeResponseType = Awaited<ReturnType<typeof _exports.fn>> &
  _GetProductByQRCodeResponseType;

export type UploadProductSuggestionInputs = {
  [key in keyof typeof _exports.inputs]: typeof _exports.inputs[key]['type'] extends 'string'
    ? string
    : typeof _exports.inputs[key]['type'] extends 'number'
    ? number
    : typeof _exports.inputs[key]['type'] extends 'boolean'
    ? boolean
    : any;
} & {
  // ... type overrides here
} & _GetProductFromQRcode;

module.exports = _exports;
