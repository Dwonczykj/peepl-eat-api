import { Slot } from "../interfaces/vendors/slot";

/* eslint-disable no-console */
declare var OpeningHours: any;
declare var FulfilmentMethod: any;
const moment = require('moment');
declare var sails: any;
declare var DeliveryPartner: any;

const requestDeliveryAvailability = !!sails.config.custom.requestDeliveryAvailability;

const DELIVERY_AVAIL_PENDING:number = null;

export class DeliveryAvailability {
  provisionalDeliveryId?: number;
  deliveryPartnerId?: number;
  get status(): string {
    if(
      this.provisionalDeliveryId !== null &&
      this.provisionalDeliveryId !== undefined
    ){
      return 'accepted';
    } else if(this.provisionalDeliveryId === DELIVERY_AVAIL_PENDING){
      return 'pending';
    } else {
      return 'failed';
    }
  }

  constructor(deliveryPartnerId: number, provisionalDeliveryId?: number) {
    this.provisionalDeliveryId = provisionalDeliveryId;
    this.deliveryPartnerId = deliveryPartnerId;
  }
}

export class DeliveryInformation {
  deliverBefore: Date;
  deliverAfter: Date;

  pickupAddressLineOne: string;
  pickupAddressLineTwo: string;
  pickupAddressCity: string;
  pickupAddressPostCode: string;

  pickupContactName: string;

  deliveryContactName: string;
  deliveryPhoneNumber: string;
  deliveryComments: string;
  deliveryAddressLineOne: string;
  deliveryAddressLineTwo: string;
  deliveryAddressCity: string;
  deliveryAddressPostCode: string;

  vegiOrderId: string;

  constructor(
    deliverBefore: Date,
    deliverAfter: Date,
    pickupAddressLineOne: string,
    pickupAddressLineTwo: string,
    pickupAddressCity: string,
    pickupAddressPostCode: string,
    pickupContactName: string,
    deliveryContactName: string,
    deliveryPhoneNumber: string,
    deliveryComments: string,
    deliveryAddressLineOne: string,
    deliveryAddressLineTwo: string,
    deliveryAddressCity: string,
    deliveryAddressPostCode: string,
    vegiOrderId: string
  ) {
    this.deliverBefore=deliverBefore;
    this.deliverAfter=deliverAfter;
    this.pickupAddressLineOne=pickupAddressLineOne;
    this.pickupAddressLineTwo=pickupAddressLineTwo;
    this.pickupAddressCity=pickupAddressCity;
    this.pickupAddressPostCode=pickupAddressPostCode;
    this.pickupContactName=pickupContactName;
    this.deliveryContactName=deliveryContactName;
    this.deliveryPhoneNumber=deliveryPhoneNumber;
    this.deliveryComments=deliveryComments;
    this.deliveryAddressLineOne=deliveryAddressLineOne;
    this.deliveryAddressLineTwo=deliveryAddressLineTwo;
    this.deliveryAddressCity=deliveryAddressCity;
    this.deliveryAddressPostCode=deliveryAddressPostCode;
    this.vegiOrderId=vegiOrderId;
  }
}

export enum DeliveryStatus {
  rejected = 'rejected',
  accepted = 'accepted',
  riderOnRouteToPickup = 'riderOnRouteToPickup',
  riderOnRouteToCustomer = 'riderOnRouteToCustomer',
  pickUpFailed = 'pickUpFailed',
  dropOffFailed = 'dropOffFailed',
  delivered = 'delivered',
  emailResponseRequested= 'emailResponseRequested',
  unknown = 'unknown',
}

export enum RequestReceived {
  received,
  failed,
}

export enum DeliveryConfirmation {
  success = 0,
  pendingEmail = 2,
  cancelled = 1,
  failure = -1,
}

export interface IDeliveryPartner {
  deliveryPartnerName: string;
  deliveryPartnerId: number;

  requestProvisionalDeliveryAvailability: (
    inputs: DeliveryInformation
  ) => Promise<DeliveryAvailability>;

  requestProvisionalDeliveryAvailabilityInternal: (
    inputs: DeliveryInformation
  ) => Promise<DeliveryAvailability>;

  requestDeliveryConfirmation: (
    provisionalDeliveryId: number,
    deliveryInfo: DeliveryInformation
  ) => Promise<DeliveryConfirmation>;

  cancelProvisionalDelivery: (
    provisionalDeliveryId: number,
    deliveryInfo: DeliveryInformation
  ) => Promise<RequestReceived>;

  checkDeliveryStatus: (
    provisionalDeliveryId: number,
    deliveryInfo: DeliveryInformation
  ) => Promise<DeliveryStatus>;
}

abstract class DeliveryPartnerObject implements IDeliveryPartner {
  deliveryPartnerName: string;
  deliveryPartnerId: number;
  deliveryPartner: any;
  DeliveryPartnerSailsModel: any;

  constructor(name: string, DeliveryPartnerSailsModel: any) {
    this._setDeliveryPartner(name);
    this.DeliveryPartnerSailsModel = DeliveryPartnerSailsModel;
  }

  private async _setDeliveryPartner(name: string): Promise<void> {
    this.deliveryPartner = await this.DeliveryPartnerSailsModel.findOne({
      name: name,
    });
    this.deliveryPartnerName = this.deliveryPartner.name;
    this.deliveryPartnerId = this.deliveryPartner.id;
    return Promise.resolve();
  }

  async requestProvisionalDeliveryAvailability(
    inputs: DeliveryInformation
  ): Promise<DeliveryAvailability> {
    if (!requestDeliveryAvailability) {
      const order = Order.findOne({
        publicId: inputs.vegiOrderId,
      });
      const dPdeliverySlots: Slot[] = await sails.helpers
        .getAvailableSlots(
          inputs.deliverAfter,
          this.deliveryPartner.deliveryFulfilmentMethod.id
        )
        .map((slot) => Slot.from(slot));
      const slotOk =
        dPdeliverySlots.filter((slot) => {
          moment.utc(order.fulfilmentSlotFrom).isSameOrAfter(slot.startTime) &&
            moment.utc(order.fulfilmentSlotFrom).isSameOrBefore(slot.endTime) &&
            moment.utc(order.fulfilmentSlotTo).isSameOrAfter(slot.startTime) &&
            moment.utc(order.fulfilmentSlotTo).isSameOrBefore(slot.endTime);
        }).length > 0;
      if (!slotOk) {
        await Order.updateOne({ publicId: inputs.vegiOrderId }).set({
          deliveryPartnerAccepted: false,
        });
      } else {
        await Order.updateOne({ publicId: inputs.vegiOrderId }).set({
          deliveryPartnerAccepted: true,
        });
      }
      return Promise.resolve(
        new DeliveryAvailability(this.deliveryPartnerId, 999)
      );
    }
    return this.requestProvisionalDeliveryAvailabilityInternal(inputs);
  }

  abstract requestProvisionalDeliveryAvailabilityInternal(
    inputs: DeliveryInformation
  ): Promise<DeliveryAvailability>;

  abstract requestDeliveryConfirmation(
    provisionalDeliveryId: number,
    deliveryInfo: DeliveryInformation
  ): Promise<DeliveryConfirmation>;

  abstract cancelProvisionalDelivery(
    provisionalDeliveryId: number,
    deliveryInfo: DeliveryInformation
  ): Promise<RequestReceived>;

  abstract checkDeliveryStatus(
    provisionalDeliveryId: number,
    deliveryInfo: DeliveryInformation
  ): Promise<DeliveryStatus>;
}

class DummyAxiosClient {
  get: (url:string) => Promise<any> = (url:string) => {
    console.info(`DUMMY GET -> ${url}`);
    
    return Promise.resolve({statusCode: 200});
  }

  put: (url:string, data) => Promise<any> = (url:string) => {
    console.info(`DUMMY PUT -> ${url}`);
    
    return Promise.resolve({statusCode: 200});
  }

  post: (url:string, data) => Promise<any> = (url:string) => {
    console.info(`DUMMY POST -> ${url}`);
    if(url === '/api/deliveries/availability'){
      return Promise.resolve({
        statusCode: 200,
        data: {status: 'confirmed'}
      });
    }
    return Promise.resolve({statusCode: 200});
  }

  static create = (config:{}) => new DummyAxiosClient();
}

export class CoopCycleDeliveryPartner extends DeliveryPartnerObject {
  client?:any;

  // * These are the CoopCycle Endpoints, they could be moved to a config file?
  private _requestDeliveryAvailabilityUrl = '/api/deliveries/availability'; //! Does not exist
  private _requestDeliveryConfirmationUrl = '/api/deliveries/confirmation'; //! Does not exist
  private _requestDeliveryCancellationUrl = '/api/deliveries/cancellation'; //! Does not exist
  private _requestDeliveryUrl = '/api/deliveries';
  private _requestJwtUrl = '/oauth2/token';

  constructor(DeliveryPartnerSailsModel: any) {
    super("CoopCycle", DeliveryPartnerSailsModel);
    this._startSession();
  }

  private async _startSession() {
    var axios = require('axios');

    // TODO: Better management of Coopcycle JWT (move to DB and refresh after expiry?)
    var jwtRequest = await axios({
      method: 'post',
      url: sails.config.custom.coopcycleUrl + this._requestJwtUrl,
      auth: {
        username: 'b8836e8d6ebb19ef277f02da9ec32e58',
        password: '191f1c9a6593b48b166ae089b661237d3c7137d722edf41aecb070a9b7a6b8a6b73151a8336574440d683c2406f2d9ad7d50951bc9da0c742f17c59ac720b2e8'
      },
      data: {
        'grant_type': 'client_credentials',
        'scope': 'deliveries'
      }
    })
    .catch((err)=> {
      sails.log.warn(err);
    });

    // Create HTTP client with new access token
    this.client = axios.create({
      baseURL: sails.config.custom.coopcycleUrl,
      timeout: 5000,
      headers: {'Authorization': 'Bearer ' + jwtRequest.data.access_token, 'Content-Type': 'application/ld+json'}
    });
  }

  async requestProvisionalDeliveryAvailabilityInternal(
    inputs: DeliveryInformation,
  ): Promise<DeliveryAvailability> {
    
    var deliverBefore = moment.unix(inputs.deliverBefore).calendar();
    var deliverAfter = moment.unix(inputs.deliverAfter).calendar();

    var requestBody = {
      pickup: {
        address: {
          streetAddress: `${inputs.pickupAddressLineOne}, ${inputs.pickupAddressLineTwo}, ${inputs.pickupAddressCity}, ${inputs.pickupAddressPostCode}`,
        },
      },
      dropoff: {
        address: {
          contactName: inputs.deliveryContactName,
          telephone: inputs.deliveryPhoneNumber,
          comments: inputs.deliveryComments,
          streetAddress: `${inputs.deliveryAddressLineOne}, ${inputs.deliveryAddressLineTwo}, ${inputs.deliveryAddressCity}, ${inputs.deliveryAddressPostCode}`
        },
        before: deliverBefore,
        after: deliverAfter
      }
    };

    // Send the delivery information to Coopcycle
    var response = await this.client.post(this._requestDeliveryAvailabilityUrl, requestBody)
    .catch((err) => {
      sails.log.info('Error requesting delivery availability from ' + this.deliveryPartnerName + '.');
      sails.log.warn(err);
    });

    return new DeliveryAvailability(this.deliveryPartnerId, response.data.id);
  }

  async requestDeliveryConfirmation(
    provisionalDeliveryId: number,
    info: DeliveryInformation,
  ): Promise<DeliveryConfirmation> {
    var requestBody = {
      id: provisionalDeliveryId
    };

    // Send the delivery information to Coopcycle
    var response = await this.client.post(this._requestDeliveryAvailabilityUrl, requestBody)
      .catch((err) => {
        sails.log.info('Error confirming the delivery from ' + this.deliveryPartnerName + '.');
        sails.log.warn(err);
        return DeliveryConfirmation.failure;
      });

    if (response.data.status === 'confirmed'){
      return DeliveryConfirmation.success;
    } else if (response.data.status === 'cancelled') {
      return DeliveryConfirmation.cancelled;
    } else {
      return DeliveryConfirmation.failure;
    }
  }

  async cancelProvisionalDelivery(
    provisionalDeliveryId: number,
    info: DeliveryInformation,
  ): Promise<RequestReceived> {
    var requestBody = {
      id: provisionalDeliveryId
    };

    // Send the delivery information to Coopcycle
    var response = await this.client.post(this._requestDeliveryCancellationUrl, requestBody)
      .catch((err) => {
        sails.log.info('Error cancelling the delivery from ' + this.deliveryPartnerName + '.');
        sails.log.warn(err);
        return RequestReceived.failed;
      });

    if (response.statusCode === 200){
      return RequestReceived.received;
    } else {
      return RequestReceived.failed;
    }
  }

  async checkDeliveryStatus(provisionalDeliveryId: number, info: DeliveryInformation): Promise<DeliveryStatus> {
    var requestBody = {
      id: provisionalDeliveryId
    };

    // Send the delivery information to Coopcycle
    var response = await this.client.post(this._requestDeliveryAvailabilityUrl, requestBody)
      .catch((err) => {
        sails.log.info('Error fetching the delivery.');
        sails.log.warn(err);
        return DeliveryStatus.unknown;
      });

    for (let element in DeliveryStatus) {
      if (response.data.status.toString().toLowerCase() === ''){
        return DeliveryStatus[element];
      }
    }
    return DeliveryStatus.unknown;
  }
}

export class AgileDeliveryPartner extends DeliveryPartnerObject {
  client?: any; //Send Emails to Agile with delivery requests and information
  //TODO: Expose a dashboard for Agile to login to and accept a delivery that is backed by an api that allows deliveryPartners to programatically accept delivery requests. each deliveryrequest needs to have the vegi order id for this to be doable

  private _requestDeliveryAvailabilityEmailAddress = "danny@agile.com"; //! Does not exist

  constructor(DeliveryPartnerSailsModel: any) {
    super("Agile",DeliveryPartnerSailsModel);
  }

  async requestProvisionalDeliveryAvailabilityInternal(
    deliveryInformation: DeliveryInformation
  ): Promise<DeliveryAvailability> {
    if (!requestDeliveryAvailability) {
      return Promise.resolve(
        new DeliveryAvailability(this.deliveryPartnerId, 999)
      );
    }

    var deliverBefore = moment
      .unix(deliveryInformation.deliverBefore)
      .calendar(); // TODO: Correct the formatting for this line to Today if today, 14:34 (16/08/2022 14:34 +00)
    var deliverAfter = moment.unix(deliveryInformation.deliverAfter).calendar();

    var requestBody = {
      vegiOrderId: deliveryInformation.vegiOrderId, // * Needed for non-HTTP deliveryPartner clients
      subject: "vegi Delivery Request - #" + deliveryInformation.vegiOrderId,
      message:
        "Please confirm delivery availability for the following delivery details",
      pickup: {
        address: {
          streetAddress: `${deliveryInformation.pickupAddressLineOne}, ${deliveryInformation.pickupAddressLineTwo}, ${deliveryInformation.pickupAddressCity}, ${deliveryInformation.pickupAddressPostCode}`,
          name: deliveryInformation.pickupContactName,
        },
      },
      dropoff: {
        address: {
          contactName: deliveryInformation.deliveryContactName,
          telephone: deliveryInformation.deliveryPhoneNumber,
          comments: deliveryInformation.deliveryComments,
          streetAddress: `${deliveryInformation.deliveryAddressLineOne}, ${deliveryInformation.deliveryAddressLineTwo}, ${deliveryInformation.deliveryAddressCity}, ${deliveryInformation.deliveryAddressPostCode}`,
        },
        before: deliverBefore,
        after: deliverAfter,
      },
    };

    // Send the delivery information to DeliveryPartner
    await sails.helpers.sendTemplateEmail
      .with({
        template: "email-request-deliveryPartner-availability",
        templateData: {
          vegiOrderId: requestBody.vegiOrderId,
          pickup: requestBody.pickup,
          dropoff: requestBody.dropoff,
        },
        to: this._requestDeliveryAvailabilityEmailAddress,
        subject: requestBody.subject,
        layout: false,
      })
      .intercept("", (err) => {
        sails.log.info(
          "Error requesting delivery availability from " +
            this.deliveryPartnerName +
            "."
        );
        sails.log.warn(err);
      });

    return new DeliveryAvailability(
      this.deliveryPartnerId,
      DELIVERY_AVAIL_PENDING
    );
  }

  async requestDeliveryConfirmation(
    provisionalDeliveryId: number,
    deliveryInformation: DeliveryInformation
  ): Promise<DeliveryConfirmation> {
    var deliverBefore = moment
      .unix(deliveryInformation.deliverBefore)
      .calendar(); // TODO: Correct the formatting for this line to Today if today, 14:34 (16/08/2022 14:34 +00)
    var deliverAfter = moment.unix(deliveryInformation.deliverAfter).calendar();

    var requestBody = {
      vegiOrderId: deliveryInformation.vegiOrderId, // * Needed for non-HTTP deliveryPartner clients
      subject:
        "vegi Delivery Confirmation Request - #" +
        deliveryInformation.vegiOrderId,
      id: provisionalDeliveryId,
      message: "Please confirm delivery for this delivery id",
      pickup: {
        address: {
          streetAddress: `${deliveryInformation.pickupAddressLineOne}, ${deliveryInformation.pickupAddressLineTwo}, ${deliveryInformation.pickupAddressCity}, ${deliveryInformation.pickupAddressPostCode}`,
          name: deliveryInformation.pickupContactName,
        },
      },
      dropoff: {
        address: {
          contactName: deliveryInformation.deliveryContactName,
          telephone: deliveryInformation.deliveryPhoneNumber,
          comments: deliveryInformation.deliveryComments,
          streetAddress: `${deliveryInformation.deliveryAddressLineOne}, ${deliveryInformation.deliveryAddressLineTwo}, ${deliveryInformation.deliveryAddressCity}, ${deliveryInformation.deliveryAddressPostCode}`,
        },
        before: deliverBefore,
        after: deliverAfter,
      },
    };

    // Send the delivery information to DeliveryPartner
    await sails.helpers.sendTemplateEmail
      .with({
        template: "email-request-deliveryPartner-confirmation",
        templateData: {
          vegiOrderId: requestBody.vegiOrderId,
          pickup: requestBody.pickup,
          dropoff: requestBody.dropoff,
        },
        to: this._requestDeliveryAvailabilityEmailAddress,
        subject: requestBody.subject,
        layout: false,
      })
      .intercept("", (err) => {
        sails.log.info(
          "Error requesting delivery availability from " +
            this.deliveryPartnerName +
            "."
        );
        sails.log.warn(err);
      });

    //TODO: We either need a button for Danny to login and click to accept Delivery Request for Availability or we need to have someone check for inbound emails.
    return DeliveryConfirmation.pendingEmail;
  }

  async cancelProvisionalDelivery(
    provisionalDeliveryId: number,
    deliveryInformation: DeliveryInformation
  ): Promise<RequestReceived> {
    var deliverBefore = moment
      .unix(deliveryInformation.deliverBefore)
      .calendar(); // TODO: Correct the formatting for this line to Today if today, 14:34 (16/08/2022 14:34 +00)
    var deliverAfter = moment.unix(deliveryInformation.deliverAfter).calendar();

    var requestBody = {
      vegiOrderId: deliveryInformation.vegiOrderId, // * Needed for non-HTTP deliveryPartner clients
      subject:
        "vegi Delivery Cancellation Request - #" +
        deliveryInformation.vegiOrderId,
      id: provisionalDeliveryId,
      message: "Please cancel the delivery request for this delivery id",
      pickup: {
        address: {
          streetAddress: `${deliveryInformation.pickupAddressLineOne}, ${deliveryInformation.pickupAddressLineTwo}, ${deliveryInformation.pickupAddressCity}, ${deliveryInformation.pickupAddressPostCode}`,
          name: deliveryInformation.pickupContactName,
        },
      },
      dropoff: {
        address: {
          contactName: deliveryInformation.deliveryContactName,
          telephone: deliveryInformation.deliveryPhoneNumber,
          comments: deliveryInformation.deliveryComments,
          streetAddress: `${deliveryInformation.deliveryAddressLineOne}, ${deliveryInformation.deliveryAddressLineTwo}, ${deliveryInformation.deliveryAddressCity}, ${deliveryInformation.deliveryAddressPostCode}`,
        },
        before: deliverBefore,
        after: deliverAfter,
      },
    };

    // Send the delivery information to DeliveryPartner
    await sails.helpers.sendTemplateEmail
      .with({
        template: "email-request-deliveryPartner-cancellation",
        templateData: {
          vegiOrderId: requestBody.vegiOrderId,
          pickup: requestBody.pickup,
          dropoff: requestBody.dropoff,
        },
        to: this._requestDeliveryAvailabilityEmailAddress,
        subject: requestBody.subject,
        layout: false,
      })
      .intercept("", (err) => {
        sails.log.info(
          "Error requesting delivery availability from " +
            this.deliveryPartnerName +
            "."
        );
        sails.log.warn(err);
        return RequestReceived.failed;
      });
    return RequestReceived.received;
  }

  async checkDeliveryStatus(
    provisionalDeliveryId: number,
    deliveryInformation: DeliveryInformation
  ): Promise<DeliveryStatus> {
    var deliverBefore = moment
      .unix(deliveryInformation.deliverBefore)
      .calendar(); // TODO: Correct the formatting for this line to Today if today, 14:34 (16/08/2022 14:34 +00)
    var deliverAfter = moment.unix(deliveryInformation.deliverAfter).calendar();

    var requestBody = {
      vegiOrderId: deliveryInformation.vegiOrderId, // * Needed for non-HTTP deliveryPartner clients
      subject:
        "vegi Delivery Cancellation Request - #" +
        deliveryInformation.vegiOrderId,
      id: provisionalDeliveryId,
      message: "Please cancel the delivery request for this delivery id",
      pickup: {
        address: {
          streetAddress: `${deliveryInformation.pickupAddressLineOne}, ${deliveryInformation.pickupAddressLineTwo}, ${deliveryInformation.pickupAddressCity}, ${deliveryInformation.pickupAddressPostCode}`,
          name: deliveryInformation.pickupContactName,
        },
      },
      dropoff: {
        address: {
          contactName: deliveryInformation.deliveryContactName,
          telephone: deliveryInformation.deliveryPhoneNumber,
          comments: deliveryInformation.deliveryComments,
          streetAddress: `${deliveryInformation.deliveryAddressLineOne}, ${deliveryInformation.deliveryAddressLineTwo}, ${deliveryInformation.deliveryAddressCity}, ${deliveryInformation.deliveryAddressPostCode}`,
        },
        before: deliverBefore,
        after: deliverAfter,
      },
    };

    // Send the delivery information to DeliveryPartner
    await sails.helpers.sendTemplateEmail
      .with({
        template: "email-request-deliveryPartner-cancellation",
        templateData: {
          vegiOrderId: requestBody.vegiOrderId,
          pickup: requestBody.pickup,
          dropoff: requestBody.dropoff,
        },
        to: this._requestDeliveryAvailabilityEmailAddress,
        subject: requestBody.subject,
        layout: false,
      })
      .intercept("", (err) => {
        sails.log.info(
          "Error requesting delivery availability from " +
            this.deliveryPartnerName +
            "."
        );
        sails.log.warn(err);
        return RequestReceived.failed;
      });

    return DeliveryStatus.emailResponseRequested;
  }
}

export const deliveryPartnersFactory = (DeliveryPartnerSailsModel: any) => [
  new CoopCycleDeliveryPartner(DeliveryPartnerSailsModel),
  new AgileDeliveryPartner(DeliveryPartnerSailsModel),
];

module.exports = {
  deliveryPartnersFactory: (DeliveryPartnerSailsModel: any) => [
    new CoopCycleDeliveryPartner(DeliveryPartnerSailsModel),
    new AgileDeliveryPartner(DeliveryPartnerSailsModel),
  ],
};


module.exports = {


  friendlyName: 'Get available deliveryPartner from pool',


  description: 'Get an available deliveryPartner from the pool of deliveryPartners',


  inputs: {
    // fulfilmentMethodId: {
    //   type: 'number',
    //   required: true,
    //   description: 'The ID of the fulfilmentMethod which is being requested.'
    // },
    // fulfilmentSlotFrom: {
    //   type: 'string',
    //   required: true,
    //   // description: 'The date for which time slots need to be generated. Format YYYY-MM-DD',
    //   // example: '2022-03-24',
    //   // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    // },
    // fulfilmentSlotTo: {
    //   type: 'string',
    //   required: true,
    //   // description: 'The date for which time slots need to be generated. Format YYYY-MM-DD',
    //   // example: '2022-03-24',
    //   // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    // },
    pickupFromVendor: {
      type: 'number',
      required: true,
    },
    deliveryContactName: {
      type: 'string',
      required: true,
    },
    deliveryPhoneNumber: {
      type: 'string',
      required: true,
    },
    deliveryComments: {
      type: 'string',
      required: true,
    },
    deliveryAddressLineOne: {
      type: 'string',
      required: true,
    },
    deliveryAddressLineTwo: {
      type: 'string',
      defaultsTo: '',
    },
    deliveryAddressCity: {
      type: 'string',
      required: true,
    },
    deliveryAddressPostCode: {
      type: 'string',
      required: true,
    },
    deliverBefore: {
      type: 'number',
      description: 'a unix timestamp for a delivery slot deadline bound to be converted to string by moment.js',
    },
    deliverAfter: {
      type: 'number',
      description: 'a unix timestamp for a delivery slot start bound to be converted to string by moment.js',
    }
  },


  exits: {
    success: {
      // outputFriendlyName: 'Available slots',
    },
  },


  fn: async function (inputs) {
    // TODO: Consider timezones
    // TODO: Account for overnight opening hours
    // TODO: Generate IDs for slots to simplify logic (but must account for changes to opening hours and slot duration)
    // TODO: Limit to 7 days in future

    var deliverBefore = moment.unix(inputs.deliverBefore).calendar();
    var deliverAfter = moment.unix(inputs.deliverAfter).calendar();

    const vendor = Vendor.findOne({id:inputs.pickupFromVendor});

    var requestBody = {
      pickup: {
        address: {
          streetAddress: `${inputs.pickupAddressLineOne}, ${inputs.pickupAddressLineTwo}, ${inputs.pickupAddressCity}, ${inputs.pickupAddressPostCode}`,
        },
      },
      dropoff: {
        address: {
          contactName: inputs.deliveryContactName,
          telephone: inputs.deliveryPhoneNumber,
          comments: inputs.deliveryComments,
          streetAddress: `${inputs.deliveryAddressLineOne}, ${inputs.deliveryAddressLineTwo}, ${inputs.deliveryAddressCity}, ${inputs.deliveryAddressPostCode}`
        },
        before: deliverBefore,
        after: deliverAfter
      }
    };

    const deliveryPartners = deliveryPartnersFactory(DeliveryPartner);
    const n = deliveryPartners.length;
    var chosenDeliveryPartner:IDeliveryPartner = null;
    // for(var i = 0; i < n; i += 1) {

    // const deliveryPartner: IDeliveryPartner = deliveryPartners[i];
    const deliveryPartner: IDeliveryPartner = new AgileDeliveryPartner(DeliveryPartner);
    const deliveryAvailability = await deliveryPartner.requestProvisionalDeliveryAvailability(new DeliveryInformation(
      deliverBefore,
      deliverAfter,
      vendor.pickupAddressLineOne,
      vendor.pickupAddressLineTwo,
      vendor.pickupAddressCity,
      vendor.pickupAddressPostCode,
      vendor.name,
      inputs.deliveryContactName,
      inputs.deliveryPhoneNumber,
      inputs.deliveryComments,
      inputs.deliveryAddressLineOne,
      inputs.deliveryAddressLineTwo,
      inputs.deliveryAddressCity,
      inputs.deliveryAddressPostCode,
      inputs.vegiOrderId
    ));
    if(deliveryAvailability.status === 'accepted'){
      chosenDeliveryPartner = deliveryPartner;
      // break;
    } else if(deliveryAvailability.status === 'pending' && chosenDeliveryPartner === null) {
      chosenDeliveryPartner = deliveryPartner;
    }
    // }
    return chosenDeliveryPartner;
  }
};
