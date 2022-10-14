import moment from "moment";
import { Slot } from "../vendors/slot";

/* eslint-disable no-console */
declare var sails: any;

const DELIVERY_AVAIL_PENDING: number = null;

export class DeliveryAvailability {
  provisionalDeliveryId?: number;
  deliveryPartnerId?: number;
  get status(): string {
    if (
      this.provisionalDeliveryId !== null &&
      this.provisionalDeliveryId !== undefined
    ) {
      return "accepted";
    } else if (this.provisionalDeliveryId === DELIVERY_AVAIL_PENDING) {
      return "pending";
    } else {
      return "failed";
    }
  }

  constructor(deliveryPartnerId: number, provisionalDeliveryId?: number) {
    this.provisionalDeliveryId = provisionalDeliveryId;
    this.deliveryPartnerId = deliveryPartnerId;
  }
}

export class DeliveryInformation {
  deliverBefore: moment.Moment;
  deliverAfter: moment.Moment;

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

  constructor(
    deliverBefore: moment.Moment,
    deliverAfter: moment.Moment,
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
  ) {
    this.deliverBefore = deliverBefore;
    this.deliverAfter = deliverAfter;
    this.pickupAddressLineOne = pickupAddressLineOne;
    this.pickupAddressLineTwo = pickupAddressLineTwo;
    this.pickupAddressCity = pickupAddressCity;
    this.pickupAddressPostCode = pickupAddressPostCode;
    this.pickupContactName = pickupContactName;
    this.deliveryContactName = deliveryContactName;
    this.deliveryPhoneNumber = deliveryPhoneNumber;
    this.deliveryComments = deliveryComments;
    this.deliveryAddressLineOne = deliveryAddressLineOne;
    this.deliveryAddressLineTwo = deliveryAddressLineTwo;
    this.deliveryAddressCity = deliveryAddressCity;
    this.deliveryAddressPostCode = deliveryAddressPostCode;
  }
}

export class DeliveryInformationPostOrder extends DeliveryInformation {
  vegiPublicOrderId: string;
  constructor(
    deliverBefore: moment.Moment,
    deliverAfter: moment.Moment,
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
    vegiPublicOrderId: string
  ) {
    super(
      deliverBefore,
      deliverAfter,
      pickupAddressLineOne,
      pickupAddressLineTwo,
      pickupAddressCity,
      pickupAddressPostCode,
      pickupContactName,
      deliveryContactName,
      deliveryPhoneNumber,
      deliveryComments,
      deliveryAddressLineOne,
      deliveryAddressLineTwo,
      deliveryAddressCity,
      deliveryAddressPostCode
    );
    this.vegiPublicOrderId = vegiPublicOrderId;
  }
}

export enum DeliveryStatus {
  rejected = "rejected",
  accepted = "accepted",
  riderOnRouteToPickup = "riderOnRouteToPickup",
  riderOnRouteToCustomer = "riderOnRouteToCustomer",
  pickUpFailed = "pickUpFailed",
  dropOffFailed = "dropOffFailed",
  delivered = "delivered",
  emailResponseRequested = "emailResponseRequested",
  unknown = "unknown",
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
  deliveryPartner: any;

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

export abstract class DeliveryPartnerObject implements IDeliveryPartner {
  deliveryPartnerName: string;
  deliveryPartnerId: number;
  deliveryPartner: any;
  DeliveryPartnerSailsModel: any;
  requestDeliveryAvailability: boolean;

  constructor(sails, deliveryPartner: any) {
    this.deliveryPartner = deliveryPartner;
    this.deliveryPartnerName = this.deliveryPartner.name;
    this.deliveryPartnerId = this.deliveryPartner.id;
    this.requestDeliveryAvailability =
      !!sails.config.custom.requestDeliveryAvailability;
  }

  async requestProvisionalDeliveryAvailability(
    inputs: DeliveryInformation
  ): Promise<DeliveryAvailability> {
    if (!this.requestDeliveryAvailability) {
      return Promise.resolve(
        new DeliveryAvailability(this.deliveryPartnerId, 999)
      );
    }
    return this.requestProvisionalDeliveryAvailabilityInternal(inputs);
  }

  async setDeliveryPartnerAcceptedOrder(inputs: DeliveryInformation, orderPublicId: number) {
    const order = await Order.findOne({
      publicId: orderPublicId,
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
      await Order.updateOne({ publicId: orderPublicId }).set({
        deliveryPartnerAccepted: false,
      });
    } else {
      await Order.updateOne({ publicId: orderPublicId }).set({
        deliveryPartnerAccepted: true,
      });
    }
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

export class DummyAxiosClient {
  get: (url: string) => Promise<any> = (url: string) => {
    console.info(`DUMMY GET -> ${url}`);

    return Promise.resolve({ statusCode: 200 });
  };

  put: (url: string, data) => Promise<any> = (url: string) => {
    console.info(`DUMMY PUT -> ${url}`);

    return Promise.resolve({ statusCode: 200 });
  };

  post: (url: string, data) => Promise<any> = (url: string) => {
    console.info(`DUMMY POST -> ${url}`);
    if (url === "/api/deliveries/availability") {
      return Promise.resolve({
        statusCode: 200,
        data: { status: "confirmed" },
      });
    }
    return Promise.resolve({ statusCode: 200 });
  };

  static create = (config: {}) => new DummyAxiosClient();
}

export class HttpDeliveryPartner extends DeliveryPartnerObject {
  client?: any;

  // * These are the CoopCycle Endpoints, they could be moved to a config file?
  private _requestDeliveryAvailabilityUrl = "/api/deliveries/availability"; //! Does not exist
  private _requestDeliveryConfirmationUrl = "/api/deliveries/confirmation"; //! Does not exist
  private _requestDeliveryCancellationUrl = "/api/deliveries/cancellation"; //! Does not exist
  private _requestDeliveryUrl = "/api/deliveries";
  private _requestJwtUrl = "/oauth2/token";

  constructor(sails,deliveryPartner: any) {
    super(sails,deliveryPartner);
    this._startSession();
  }

  private async _startSession() {
    var axios = require("axios");

    // TODO: Better management of Coopcycle JWT (move to DB and refresh after expiry?)
    var jwtRequest = await axios({
      method: "post",
      url: sails.config.custom.coopcycleUrl + this._requestJwtUrl,
      auth: {
        username: "b8836e8d6ebb19ef277f02da9ec32e58",
        password:
          "191f1c9a6593b48b166ae089b661237d3c7137d722edf41aecb070a9b7a6b8a6b73151a8336574440d683c2406f2d9ad7d50951bc9da0c742f17c59ac720b2e8",
      },
      data: {
        grant_type: "client_credentials",
        scope: "deliveries",
      },
    }).catch((err) => {
      sails.log.warn(err);
    });

    // Create HTTP client with new access token
    this.client = axios.create({
      baseURL: sails.config.custom.coopcycleUrl,
      timeout: 5000,
      headers: {
        Authorization: "Bearer " + jwtRequest.data.access_token,
        "Content-Type": "application/ld+json",
      },
    });
  }

  async requestProvisionalDeliveryAvailabilityInternal(
    inputs: DeliveryInformation
  ): Promise<DeliveryAvailability> {
    if (!this.requestDeliveryAvailability) {
      return Promise.resolve(
        new DeliveryAvailability(this.deliveryPartnerId, 999)
      );
    }

    var deliverBefore = inputs.deliverBefore.format("dd-MM-YYYY HH:mm");
    var deliverAfter = inputs.deliverAfter.format("dd-MM-YYYY HH:mm");

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
          streetAddress: `${inputs.deliveryAddressLineOne}, ${inputs.deliveryAddressLineTwo}, ${inputs.deliveryAddressCity}, ${inputs.deliveryAddressPostCode}`,
        },
        before: deliverBefore,
        after: deliverAfter,
      },
    };

    // Send the delivery information to Coopcycle
    var response = await this.client
      .post(this._requestDeliveryAvailabilityUrl, requestBody)
      .catch((err) => {
        sails.log.info(
          "Error requesting delivery availability from " +
            this.deliveryPartnerName +
            "."
        );
        sails.log.warn(err);
      });
    if (response.data.id) {
      return new DeliveryAvailability(this.deliveryPartnerId, response.data.id);
    } else {
      return new DeliveryAvailability(this.deliveryPartnerId, null);
    }
  }

  async requestDeliveryConfirmation(
    provisionalDeliveryId: number,
    info: DeliveryInformation
  ): Promise<DeliveryConfirmation> {
    var requestBody = {
      id: provisionalDeliveryId,
    };

    // Send the delivery information to Coopcycle
    var response = await this.client
      .post(this._requestDeliveryAvailabilityUrl, requestBody)
      .catch((err) => {
        sails.log.info(
          "Error confirming the delivery from " + this.deliveryPartnerName + "."
        );
        sails.log.warn(err);
        return DeliveryConfirmation.failure;
      });

    if (response.data.status === "confirmed") {
      return DeliveryConfirmation.success;
    } else if (response.data.status === "cancelled") {
      return DeliveryConfirmation.cancelled;
    } else {
      return DeliveryConfirmation.failure;
    }
  }

  async cancelProvisionalDelivery(
    provisionalDeliveryId: number,
    info: DeliveryInformation
  ): Promise<RequestReceived> {
    var requestBody = {
      id: provisionalDeliveryId,
    };

    // Send the delivery information to Coopcycle
    var response = await this.client
      .post(this._requestDeliveryCancellationUrl, requestBody)
      .catch((err) => {
        sails.log.info(
          "Error cancelling the delivery from " + this.deliveryPartnerName + "."
        );
        sails.log.warn(err);
        return RequestReceived.failed;
      });

    if (response.statusCode === 200) {
      return RequestReceived.received;
    } else {
      return RequestReceived.failed;
    }
  }

  async checkDeliveryStatus(
    provisionalDeliveryId: number,
    info: DeliveryInformation
  ): Promise<DeliveryStatus> {
    var requestBody = {
      id: provisionalDeliveryId,
    };

    // Send the delivery information to Coopcycle
    var response = await this.client
      .post(this._requestDeliveryAvailabilityUrl, requestBody)
      .catch((err) => {
        sails.log.info("Error fetching the delivery.");
        sails.log.warn(err);
        return DeliveryStatus.unknown;
      });

    for (let element in DeliveryStatus) {
      if (response.data.status.toString().toLowerCase() === "") {
        return DeliveryStatus[element];
      }
    }
    return DeliveryStatus.unknown;
  }
}

export class EmailDeliveryPartner extends DeliveryPartnerObject {
  client?: any; //Send Emails to Agile with delivery requests and information
  //TODO: Expose a dashboard for Agile to login to and accept a delivery that is backed by an api that allows deliveryPartners to programatically accept delivery requests. each deliveryrequest needs to have the vegi order id for this to be doable

  private _requestDeliveryAvailabilityEmailAddress = "danny@agile.com"; //! Does not exist

  constructor(sails, deliveryPartner: any) {
    super(sails, deliveryPartner);
  }

  async requestProvisionalDeliveryAvailabilityInternal(
    inputs: DeliveryInformationPostOrder
  ): Promise<DeliveryAvailability> {
    if (!this.requestDeliveryAvailability) {
      return Promise.resolve(
        new DeliveryAvailability(this.deliveryPartnerId, 999)
      );
    }

    var deliverBefore = inputs.deliverBefore.format("dd-MM-YYYY HH:mm");
    var deliverAfter = inputs.deliverAfter.format("dd-MM-YYYY HH:mm");
    var deliveryInformation = inputs;
    var requestBody = {
      vegiOrderId: deliveryInformation.vegiPublicOrderId, // * Needed for non-HTTP deliveryPartner clients
      subject:
        "vegi Delivery Request - #" + deliveryInformation.vegiPublicOrderId,
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
    deliveryInformation: DeliveryInformationPostOrder
  ): Promise<DeliveryConfirmation> {
    var deliverBefore = deliveryInformation.deliverBefore;
    var deliverAfter = deliveryInformation.deliverAfter;

    var requestBody = {
      vegiOrderId: deliveryInformation.vegiPublicOrderId, // * Needed for non-HTTP deliveryPartner clients
      subject:
        "vegi Delivery Confirmation Request - #" +
        deliveryInformation.vegiPublicOrderId,
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
    deliveryInformation: DeliveryInformationPostOrder
  ): Promise<RequestReceived> {
    var deliverBefore = deliveryInformation.deliverBefore;
    var deliverAfter = deliveryInformation.deliverAfter;

    var requestBody = {
      vegiOrderId: deliveryInformation.vegiPublicOrderId, // * Needed for non-HTTP deliveryPartner clients
      subject:
        "vegi Delivery Cancellation Request - #" +
        deliveryInformation.vegiPublicOrderId,
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
    deliveryInformation: DeliveryInformationPostOrder
  ): Promise<DeliveryStatus> {
    var deliverBefore = deliveryInformation.deliverBefore;
    var deliverAfter = deliveryInformation.deliverAfter;

    var requestBody = {
      vegiOrderId: deliveryInformation.vegiPublicOrderId, // * Needed for non-HTTP deliveryPartner clients
      subject:
        "vegi Delivery Cancellation Request - #" +
        deliveryInformation.vegiPublicOrderId,
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

const deliveryPartnerHelperLookup = {
  Agile: EmailDeliveryPartner,
  CoopCycle: HttpDeliveryPartner,
  // Shocal: ShocalDeliveryPartner,
};

export const getDeliveryPartnerHelpers = (sails, deliveryPartners: Array<any>) =>
  deliveryPartners.map((deliveryPartner) =>
    Object.keys(deliveryPartnerHelperLookup).includes(deliveryPartner.name)
      ? new deliveryPartnerHelperLookup[deliveryPartner.name](sails, deliveryPartner)
      : new EmailDeliveryPartner(sails, deliveryPartner)
  );

// module.exports = {
//   DeliveryPartnerObject,
//   EmailDeliveryPartner,
//   HttpDeliveryPartner,
//   getDeliveryPartnerHelpers: (deliveryPartners: Array<any>) =>
//     getDeliveryPartnerHelpers(deliveryPartners),
// };
