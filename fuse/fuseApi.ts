import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import util from 'util';
import moment from 'moment';
import { SailsModelType } from '../api/interfaces/iSails';
import { SailsDBError, TransactionType, AccountType, datetimeStrFormatExactForSQLTIMESTAMP, has, datetimeStrFormatExact } from '../scripts/utils';
import { Currency } from '../api/interfaces/peeplPay';

declare var Transaction: SailsModelType<TransactionType>;
declare var Account: SailsModelType<AccountType>;

interface FuseAdminTokensMintResponseData {
  tokenAddress: string;
  bridgeType: string;
  accountAddress: string;
  amount: string;
  toAddress: string;
}

interface FuseAdminTokensMintResponseJob {
  status: string;
  _id: string;
  name: string;
  data: FuseAdminTokensMintResponseData;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface FuseAdminTokensMintResponse {
  job: FuseAdminTokensMintResponseJob;
}

export enum FuseJobNameEnum {
  createToken = 'createToken',
  mint = 'mint',
  adminTransfer = 'adminTransfer',
  adminApprove = 'adminApprove',
  createWallet = 'createWallet',
}

type FuseJobNameLiteral =
  | 'createToken'
  | 'mint'
  | 'adminTransfer'
  | 'adminApprove'
  | 'createWallet';

// * Fuse Jobs Interfaces
interface TxFee {
  $numberDecimal: string;
}

interface TransactionBody {
  status: string;
  blockNumber: number;
}

interface FuseJobCreateTokenDataEmbed {
  bridgeType: string;
  accountAddress: string;
  name: string;
  symbol: string;
  initialSupplyInWei: string;
  tokenURI: string;
  expiryTimestamp: number;
  spendabilityIdsArr: string[];
  txHash: string;
  transactionBody: TransactionBody;
  txFee: TxFee;
  blockNumber: number;
  tokenAddress: string;
}

interface FuseJobCreateTokenData {
  status: string;
  _id: string;
  name: FuseJobNameLiteral;
  data: FuseJobCreateTokenDataEmbed;
  createdAt: string;
  updatedAt: string;
  __v: number;
  accountAddress: string;
  lastFinishedAt: string;
}

export interface FuseJobCreateToken {
  data: FuseJobCreateTokenData;
}

interface FuseJobMintTokenDataEmbed {
  tokenAddress: string;
  bridgeType: string;
  accountAddress: string;
  amount: string;
  toAddress: string;
  txHash: string;
  transactionBody: TransactionBody;
  txFee: TxFee;
}

interface FuseJobMintTokenData {
  status: string;
  _id: string;
  name: FuseJobNameLiteral;
  data: FuseJobMintTokenDataEmbed;
  createdAt: string;
  updatedAt: string;
  __v: number;
  accountAddress: string;
  lastFinishedAt: string;
}

export interface FuseJobMintToken {
  data: FuseJobMintTokenData;
}

interface FuseJobAdminTransferDataEmbed {
  tokenAddress: string;
  bridgeType: string;
  accountAddress: string;
  amount: string;
  wallet: string;
  to: string;
  txHash: string;
  transactionBody: TransactionBody;
  txFee: TxFee;
}

interface FuseJobAdminTransferData {
  status: string;
  _id: string;
  name: FuseJobNameLiteral;
  data: FuseJobAdminTransferDataEmbed;
  createdAt: string;
  updatedAt: string;
  __v: number;
  accountAddress: string;
  lastFinishedAt: string;
}

export interface FuseJobAdminTransfer {
  data: FuseJobAdminTransferData;
}


interface ApproveToken {
  txHash: string;
  transactionBody: TransactionBody;
  txFee: TxFee;
}

interface FuseJobAdminApproveDataEmbed {
  tokenAddress: string;
  bridgeType: string;
  accountAddress: string;
  amount: string;
  wallet: string;
  spender: string;
  burnFromAddress: string;
  correlationId: string;
  approveToken: ApproveToken;
  txFee: TxFee;
  burnFrom: ApproveToken;
}

interface FuseJobAdminApproveData {
  status: string;
  _id: string;
  name: FuseJobNameLiteral;
  data: FuseJobAdminApproveDataEmbed;
  createdAt: string;
  updatedAt: string;
  __v: number;
  accountAddress: string;
  lastFinishedAt: string;
}

export interface FuseJobAdminApprove {
  data: FuseJobAdminApproveData;
}

interface FuseJobCreateWalletDataEmbed {
  owner: string;
  phoneNumber: string;
  _id: string;
  salt: string;
  txHash: string;
  transactionBody: TransactionBody;
  txFee: TxFee;
  walletAddress: string;
}

interface FuseJobCreateWalletData {
  status: string;
  _id: string;
  name: FuseJobNameLiteral;
  data: FuseJobCreateWalletDataEmbed;
  createdAt: string;
  updatedAt: string;
  __v: number;
  accountAddress: string;
  lastFinishedAt: string;
}

export interface FuseJobCreateWallet {
  data: FuseJobCreateWalletData;
}


export type FuseEventGeneric = {
  to: string;
  from: string;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  tokenType: string;
  tokenAddress: string;
  projectId: string;
  direction: string;
}

/**
 * See https://docs.fuse.io/docs/notification-api/notifications-api#external-native-fuse-transfers
 * @date 09/06/2023 - 16:32:35
 *
 * @export
 * @type FuseEventNativeFuseTransfer
 * @typedef {FuseEventNativeFuseTransfer}
 */
export type FuseEventNativeFuseTransfer = FuseEventGeneric & {
  to: string;
  from: string;
  /**
   * Note that the value field consists of the decimals of the token. In the below example 1 Fuse was transferred, and as Native Fuse has 18 decimals, we see the value 100000000000000000 (i.e. 100,000,000,000,000,000). For convenience, you can also refer to the valueEth field, which gives the value formatted without the decimals.
   */
  value: string;
  valueEth: string;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  tokenType: string;
  tokenAddress: string;
  projectId: string;
  direction: string;
}


/**
 * Description placeholder
 * @date 09/06/2023 - 16:30:44
 *
 * @export
 * @interface FuseEventERC20Transfer
 * @typedef {FuseEventERC20Transfer}
 * See ~ https://docs.fuse.io/docs/notification-api/notifications-api#erc20-transfers
 * @property value: Note that the value includes the decimals of the token, which is given in the tokenDecimals field. In the example below, the transferred amount is 109.7 G$ as the tokenDecimals is 2.
 */


export type FuseEventERC20Transfer = FuseEventGeneric &  {
  to: string;
  from: string;
  txHash: string;
  tokenAddress: string;
  blockNumber: number;
  blockHash: string;
  tokenType: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: string;
  /**
   * Note that the value includes the decimals of the token, which is given in the tokenDecimals field. In the example below, the transferred amount is 109.7 G$ as the tokenDecimals is 2.
   */
  value: string;
  projectId: string;
  direction: string;
}


export type FuseEventInternativeNativeFuseTransfer = FuseEventGeneric &  {
  to: string;
  from: string;
  value: string;
  valueEth: string;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  tokenType: string;
  tokenAddress: string;
  isInternalTransaction: boolean;
  projectId: string;
  direction: string;
}


let config = {
  fuseApiV2Url: '',
  fuseApiJwt: '',
  fuseApiPublicKey: '',
  fuseApiSecret: '',
  fuseVegiCommunityCustodianWalletAddress: '',
  fuseVegiCommunityGreenBeanTokenAddress: '',
  fuseVegiCommunityGreenPointNetworkType: 'fuse',
};

if (process.env['local'] || process.env['local.js']) {
  // eslint-disable-next-line no-console
  console.log(
    `Loading config from local env vars for ${__dirname}${__filename}`
  );
  const localConfigFromDotEnv = JSON.parse(
    Buffer.from(process.env['local'] || process.env['local.js'], 'base64').toString()
  );
  config = localConfigFromDotEnv.config.custom;
}

const urlBase = config['fuseApiV2Url'] || 'https://api.fuse.io/api/v0/admin/'; // TODO: Update config to use this too...
const adminJwtToken = config['fuseApiJwt'];
const fusePostRequestHeadersBase = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'API-SECRET': config['fuseApiSecret'],
};
const fuseGetRequestHeadersBase = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'API-SECRET': config['fuseApiSecret'],
};
const fuseGetRequestQueryParamsBase = {
  apiKey: config['fuseApiPublicKey'],
};

export function generateCorrelationId () {
  return '_' + Math.random().toString(36).substr(2, 9);
}

export type MintTokensToAddressResponseType = Promise<
  | {
      transaction: null;
      response: null;
      error: any | SailsDBError;
    }
  | {
      transaction: null;
      response: AxiosResponse<FuseAdminTokensMintResponse>;
      error: Error;
    }
  | {
      transaction: any;
      response: AxiosResponse<FuseAdminTokensMintResponse>;
      error?: SailsDBError;
    }
>;

/**
 * @param toAddress is optional and when provided, then newly minted tokens will be transferred to that address
 * @param amount is amount of token to mint as an integer string
 * 
 * See https://docs.fuse.io/docs/admin-api/mint-an-erc-20-token
 */
export async function mintTokensToAddress({
  toAddress,
  amount,
  correlationId,
  orderId,
}: {
  toAddress: string;
  amount: string;
  correlationId: string;
  orderId: number | null;
}): MintTokensToAddressResponseType {
  // const body = {
  //   fuseVegiCommunityGreenBeanTokenAddress:
  //     config['fuseVegiCommunityGreenBeanTokenAddress'],
  //   fuseVegiCommunityGreenPointNetworkType:
  //     config['fuseVegiCommunityGreenPointNetworkType'],
  //   correlationId,
  //   amount,
  //   toAddress,
  // };
  // axios.post(`${urlBase}/admin/tokens/mint`, body, {
  //   headers: {
  //     Authorization: `Bearer ${adminJwtToken}`,
  //   },
  // });

  // ~ https://docs.fuse.io/docs/admin-api/mint-an-erc-20-token

  // sails.log.verbose(util.inspect(config, { depth: null }));

  let data = JSON.stringify({
    // fuseVegiCommunityGreenBeanTokenAddress:
    //   config['fuseVegiCommunityGreenBeanTokenAddress'],
    // fuseVegiCommunityGreenPointNetworkType:
    //   config['fuseVegiCommunityGreenPointNetworkType'],
    // correlationId,
    tokenAddress: config['fuseVegiCommunityGreenBeanTokenAddress'],
    amount: amount,
    toAddress: toAddress,
    // apiKey: config['fuseApiPublicKey']
  });

  const mintUrl = `${urlBase}/tokens/mint?apiKey=${config['fuseApiPublicKey']}`;

  const requestConfig: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: mintUrl,
    headers: fusePostRequestHeadersBase,
    data: data,
  };

  let response: AxiosResponse<FuseAdminTokensMintResponse>;
  try {
    const _response: AxiosResponse<FuseAdminTokensMintResponse> = await axios(
      requestConfig
    );
    response = _response;
  } catch (error) {
    sails.log.error(`Fuse Minting Url ${mintUrl} with error: ${error}`);
    sails.log.error(error);
    sails.log.error(util.inspect(error, { depth: null }));
    throw error;
    return {
      transaction: null,
      response: null,
      error: error,
    };
  }

  if (response.status !== 201 || !has('job', response.data)) {
    sails.log.error(
      `Bad response returned from "${mintUrl}": [${response.status}], ${response.statusText}, ${response}`
    );
    return;
  } else if (response.data.job.name !== FuseJobNameEnum.mint) {
    sails.log.error(
      `Bad response returned from "${mintUrl}": [${response.status}], with incorrect job type: "${response.data.job.name}"`
    );
    return;
  }
  sails.log.verbose(util.inspect(response.data, { depth: null })); // * JOB ID
  // track this jobId by adding a `pending` crypto Transaction object with the jobId on the object.
  let receiver: AccountType;
  try {
    const _receivers = await Account.find({
      walletAddress: toAddress,
    });
    if(!_receivers || !_receivers.length){
      // receiver = await Account.create({
      //   accountType: 'ethereum',
      //   walletAddress: toAddress,
      // }).fetch();
      return {
        transaction: null,
        response: response,
        error: Error(`No vegi account exists for minting receiver wallet address: "${toAddress}"`),
      };
    }
    if(_receivers.length > 1){
      sails.log.warn(`MULTIPLE ACCOUNTS EXIST WITH SAME WALLET ADDRESS: "${toAddress}"`);
    }
    receiver = _receivers[0];
  } catch (_error) {
    const error: SailsDBError = _error;
    sails.log.error(
      `[${error.code}] Error fetching receiver account from toAddress: "${toAddress}" in DB: "${error.details}"`
    );
    sails.log.error(util.inspect(error, { depth: null }));
    return {
      transaction: null,
      response: response,
      error: error,
    };
  }
  let payer: AccountType;
  try {
    const _payers = await Account.find({
      walletAddress: config.fuseVegiCommunityCustodianWalletAddress,
    });
    if(!_payers || !_payers.length){
      payer = await Account.create({
        accountType: 'ethereum',
        walletAddress: config.fuseVegiCommunityCustodianWalletAddress,
      }).fetch();
      // return {
      //   transaction: null,
      //   response: response,
      //   error: Error(`No vegi account exists for minting from vegi community custodian wallet address: "${config.fuseVegiCommunityCustodianWalletAddress}"`),
      // };
    } else if(_payers.length > 1){
      sails.log.warn(`MULTIPLE ACCOUNTS EXIST WITH SAME WALLET ADDRESS: "${config.fuseVegiCommunityCustodianWalletAddress}"`);
      payer = _payers[0];
    } else {
      payer = _payers[0];
    }
  } catch (_error) {
    const error: SailsDBError = _error;
    sails.log.error(
      `[${error.code}] Error fetching receiver account from toAddress: "${config.fuseVegiCommunityCustodianWalletAddress}" in DB: "${error.details}"`
    );
    sails.log.error(util.inspect(error, { depth: null }));
    return {
      transaction: null,
      response: response,
      error: error,
    };
  }
  let pendingTransaction;
  try {
    const _newTransactionDetails = {
      timestamp: moment(moment.now()).format(datetimeStrFormatExact), //.format(datetimeStrFormatExactForSQLTIMESTAMP),
      amount: Number.parseInt(response.data.job.data.amount),
      currency: Currency.GBT,
      status: response.data.job.status,
      remoteJobId: response.data.job._id,
      order: orderId,
      receiver: receiver.id,
      payer: payer.id,
    };
    sails.log.verbose(util.inspect(_newTransactionDetails, { depth: null }));

    pendingTransaction = await Transaction.create(_newTransactionDetails);
  } catch (_error) {
    const error: SailsDBError = _error;
    sails.log.error(
      `[${error.code}] Error creating Transaction in DB: "${error.details}"`
    );
    sails.log.error(util.inspect(error, { depth: null }));
    return {
      transaction: null,
      response: response,
      error: error,
    };
  }

  return {
    transaction: pendingTransaction,
    response: response,
  };
}

export async function transferVegiRewardTokens({
  fromAddress,
  toAddress,
  amount,
  correlationId,
}: {
  fromAddress: string;
  toAddress: string;
  amount: string;
  correlationId: string;
}) {

  let data = JSON.stringify({
    correlationId,
    tokenAddress: config['fuseVegiCommunityGreenBeanTokenAddress'],
    amount: amount,
    from: fromAddress,
    to: toAddress,
  });

  const mintUrl = `${urlBase}/tokens/transfer`;

  const requestConfig: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: mintUrl,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    data: data,
  };

  axios(requestConfig)
    .then((response) => {
      sails.log(util.inspect(response.data, { depth: null })); // * JOB ID
    })
    .catch((error) => {
      sails.log.error(`Fuse Minting Url ${mintUrl} with error: ${error}`);
      sails.log.error(`${error}`);
    });
}


// module.exports = {
//   mintTokensAndSendToken,
//   generateCorrelationId
// };
