import { FulfilmentMethodType } from "../scripts/utils";

type fmOwnerTypeLiteral = 'deliveryPartner' | 'vendor';

export class FulfilmentMethodPriorityHandler {
  static readonly priorityList: fmOwnerTypeLiteral[] = [
    'deliveryPartner',
    'vendor'
  ];
  private static _fmToName(fm:FulfilmentMethodType): fmOwnerTypeLiteral {
    return fm.deliveryPartner !== null ? 'deliveryPartner' : 'vendor';
  }
  public static pickFulfilmentMethod(fulfilmentMethods:Array<FulfilmentMethodType>){
    for (const priority of FulfilmentMethodPriorityHandler.priorityList){
      for (const fm of fulfilmentMethods){
        if (FulfilmentMethodPriorityHandler._fmToName(fm) === priority){
          return fm;
        }
      } 
    }
    // if no matches, all fms had no owners or no fms passed
    return null;
  }
}
