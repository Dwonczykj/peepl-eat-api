import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  AccountType,
  SailsActionDefnType,
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var Account: SailsModelType<AccountType>;


export type UploadUserAvatarInputs = {
  image: any;
  accountId: number;
};

export type UploadUserAvatarResponse = {
  imageUrl: string;
} | false;

export type UploadUserAvatarExits = {
  success: (unusedData: UploadUserAvatarResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
  uploadFailed: (unusedMessage: Error | string) => void;
};

const _exports: SailsActionDefnType<
  UploadUserAvatarInputs,
  UploadUserAvatarResponse,
  UploadUserAvatarExits
> = {
  friendlyName: 'UploadUserAvatar',

  files: ['image'],

  description:
    'Upload an image for a user to be viewed as their avatar...',

  inputs: {
    image: {
      type: 'ref',
      required: true,
      description: 'image byte stream',
    },
    accountId: {
      type: 'number',
      required: true,
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
      statusCode: 403,
    },
    badRequest: {
      responseType: 'badRequest',
    },
    error: {
      statusCode: 500,
    },
    uploadFailed: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: UploadUserAvatarInputs,
    exits: UploadUserAvatarExits
  ) {
    const accounts = await Account.find({
      id: inputs.accountId
    });
    if (!accounts || accounts.length < 1){
      return exits.notFound();
    }
    
    let imageUrl = '';
    if (inputs.image) {
      let imageInfo = await sails.helpers.uploadOneS3(inputs.image);
      if (imageInfo) {
        imageUrl = sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
      }
    }
    if (!imageUrl) {
      return exits.uploadFailed('Unable to upload image to S3');
    }



    const updatedAccount = await Account.update({
      id: inputs.accountId
    }).set({
      imageUrl: imageUrl,
    });

    return exits.success({
      imageUrl: imageUrl,
    });
  },
};

module.exports = _exports;
