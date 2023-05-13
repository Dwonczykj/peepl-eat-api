import { SailsActionDefnType } from '../../scripts/utils';
import {
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  WaitingListEntryType
} from '../../scripts/utils';

declare var sails: sailsVegi;
declare var WaitingList: SailsModelType<WaitingListEntryType>;


export type CheckWaitinglistOrderInputs = {};

export type CheckWaitinglistOrderResult = boolean;

export type CheckWaitinglistOrderExits = {
  success: (unusedData: CheckWaitinglistOrderResult) => any;
};

const _exports: SailsActionDefnType<
  CheckWaitinglistOrderInputs,
  CheckWaitinglistOrderResult,
  CheckWaitinglistOrderExits
> = {
  friendlyName: 'CheckWaitinglistOrder',

  inputs: {},

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: CheckWaitinglistOrderInputs,
    exits: CheckWaitinglistOrderExits
  ) {
    const queue = await WaitingList.find({
      onboarded: false,
    }).sort('order');

    let promises = [];
    let logged = false;
    for (let i = 0; i < queue.length; i++){
      const entry = queue[i];
      if (entry.order !== (i + 1)){
        // wrong order...
        if(!logged){
          sails.log(`Fixing order of waitinglist entry for email: "${entry.email}" from [${entry.order}] to [${(i+1)}]`);
          logged = true;
        }
        const updator = async () => {
          await WaitingList.updateOne({id: entry.id}).set({order: i+1});
        };
        promises.push(updator);
      }
    }

    try {
      if(promises.length > 0){
        await Promise.all(promises);
      }
    } catch (error) {
      sails.log.error(error);
      return exits.success(false);
    }

    return exits.success(true);
  },
};

module.exports = _exports;
