import {
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  AccountType,
  SailsActionDefnType,
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var Account: SailsModelType<AccountType>;


export type SetRandomAvatarInputs = {
  userId: number;
};

export type SetRandomAvatarResponse = {
  imageUrl: string;
} | false;

export type SetRandomAvatarExits = {
  success: (unusedData: SetRandomAvatarResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  SetRandomAvatarInputs,
  SetRandomAvatarResponse,
  SetRandomAvatarExits
> = {
  friendlyName: 'SetRandomAvatar',

  inputs: {
    userId: {
      type: 'number',
      required: true,
    }
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
  },

  fn: async function (
    inputs: SetRandomAvatarInputs,
    exits: SetRandomAvatarExits
  ) {
    const users = await User.find({
      id: inputs.userId,
    });
    if (!users || users.length < 1) {
      return exits.notFound();
    }

    const avatarUrls = [
      // 'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/aubergini.jpeg',
      // 'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/broc.jpeg',
      // 'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/carrot.jpeg',
      // 'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/pepper.jpeg',
      // 'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/strawbug.jpeg',
      // 'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/display-pictures_03.png',
      'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/display-pictures_03.png',
      'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/display-pictures_05.png',
      'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/display-pictures_06.png',
      'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/display-pictures_08.png',
      'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/display-pictures_09.png',
      'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/display-pictures_10.png',
      'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/display-pictures_11.png',
      'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/mushroom.png',
    ];

    const index = Math.round(Math.random() * 5);

    let imageUrl = avatarUrls[0];
    
    try {
      imageUrl = avatarUrls[index];
    } catch (error) {
      sails.log.error(`${error}`);
    }

    try {
      await User.update({
        id: inputs.userId,
      }).set({
        imageUrl: imageUrl,
      });
    } catch (error) {
      sails.log.error(`${error}`);
    }

    return exits.success({
      imageUrl: imageUrl,
    });
  },
};

module.exports = _exports;
