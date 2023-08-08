import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';
import * as firebase from '../../config/firebaseAdmin';
import Stripe from 'stripe';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  SailsActionDefnType,
  NotificationType
} from '../../scripts/utils';

declare var sails: sailsVegi;
declare var Notification: SailsModelType<NotificationType>;


export type SendFirebaseNotificationInputs = {
  topicBackup: string;
  token: string;
  title: string;
  body: string;
  data: {
    orderId?: string;
    dataObj?: Stripe.Event.Data.Object;
  } & any;
};

export type SendFirebaseNotificationResult = NotificationType | false;

export type SendFirebaseNotificationExits = {
  success: (unusedData: SendFirebaseNotificationResult) => any;
};

const _exports: SailsActionDefnType<
  SendFirebaseNotificationInputs,
  SendFirebaseNotificationResult,
  SendFirebaseNotificationExits
> = {
  friendlyName: 'SendFirebaseNotification',

  inputs: {
    topicBackup: {
      type: 'string',
      required: true
    },
    token: {
      type: 'string',
      required: true
    },
    title: {
      type: 'string',
      required: true
    },
    body: {
      type: 'string',
      defaultsTo: ''
    },
    data: {
      type: 'ref',
      defaultsTo: {}
    },
  },

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: SendFirebaseNotificationInputs,
    exits: SendFirebaseNotificationExits
  ) {
    const newNotification = await Notification.create({
      recipient: inputs.token,
      type: 'push',
      sentAt: Date.now(),
      title: inputs.title,
      order: (inputs.data && inputs.data.orderId) || null,
      metadata: JSON.stringify(
        inputs.data && inputs.data.orderId
          ? {
              model: 'order',
              id: inputs.data.orderId,
              broadcast: false,
            }
          : {
              model: '',
              id: null,
              broadcast: false,
            }
      ),
    }).fetch();

    var dontActuallySend =
      sails.config.environment === 'test' ||
      sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST;
    if (dontActuallySend) {
      sails.log
        .info(`Running sails in test mode, helpers.sendFirebaseNotification will not send notifications.
      Message would have been sent for firebase topic id: ${inputs.topicBackup} with title ${inputs.title} with body: ${inputs.body}`);
      return exits.success(newNotification);
    }

    const message = {
      // data: JSON.stringify(inputs.data),
      notification: {
        title: inputs.title,
        body: inputs.body,
      },
      token: inputs.token,
    };
    // const admin = this.req.firebase;
    await firebase
      .sendMessage(message)
      .catch((err) => {
        sails.log.error(`${err}`);
        return exits.success(false);
      });
    return exits.success(newNotification);
  },
};

module.exports = _exports;
