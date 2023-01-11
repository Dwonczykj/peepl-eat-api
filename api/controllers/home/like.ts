import { v4 as uuidv4 } from 'uuid';
import { SailsModelType } from '../../interfaces/iSails';
import { LikeType } from '../../../scripts/utils';

declare var Like:SailsModelType<LikeType>;

export type LikeInput = {
  guid?: string;
};

export type LikeResult = {
  like: LikeType;
};

module.exports = {
  friendlyName: 'Post Like',

  description: 'Post a like of the vegi platform',

  inputs: {
    guid: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
  },

  exits: {
    success: {
      statusCode: 200,
    },
  },

  fn: async function (
    inputs: LikeInput,
    exits: {
      success: (unusedArg: LikeResult) => void;
    }
  ) {
    const request = this.req;
    const headers = JSON.stringify(request.headers);
    if (!inputs.guid) {
      inputs.guid = uuidv4();
    }

    const likeInDB = await Like.create({
      guid:inputs.guid,
      headers: headers
    }).fetch();

    if(this.req.method === 'GET'){
      await this.res.redirect(sails.config.custom.vegiWebSiteJoinUs);
    }
    return exits.success({ like: likeInDB });

  },
};
