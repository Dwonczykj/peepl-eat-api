import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import util from 'util';
import moment from 'moment';
import { SailsModelType } from '../api/interfaces/iSails';
import { TransactionType, datetimeStrFormatExactForSQLTIMESTAMP, has } from '../scripts/utils';
import { Currency } from '../api/interfaces/peeplPay';

declare var Transaction: SailsModelType<TransactionType>;

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
  toAddress: string,
  amount: string,
  correlationId: string,
  orderId: number,
}) {
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

  let data = JSON.stringify({
    // fuseVegiCommunityGreenBeanTokenAddress:
    //   config['fuseVegiCommunityGreenBeanTokenAddress'],
    // fuseVegiCommunityGreenPointNetworkType:
    //   config['fuseVegiCommunityGreenPointNetworkType'],
    correlationId,
    tokenAddress: config['fuseVegiCommunityGreenBeanTokenAddress'],
    amount: amount,
    toAddress: toAddress,
  });

  const mintUrl = `${urlBase}/tokens/mint`;

  const requestConfig: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: mintUrl,
    headers: fusePostRequestHeadersBase,
    data: data,
  };

  axios(requestConfig)
    .then(async (response: AxiosResponse<FuseAdminTokensMintResponse>) => {
      if (response.status !== 201 || !has('job', response.data)) {
        sails.log.error(
          `Bad response returned from "${mintUrl}": [${response.status}], ${response.statusText}, ${response}`
        );
        return;
      } else if(response.data.job.name !== FuseJobNameEnum.mint){
        sails.log.error(
          `Bad response returned from "${mintUrl}": [${response.status}], with incorrect job type: "${response.data.job.name}"`
        );
        return;
      }
      sails.log(util.inspect(response.data, { depth: null })); // * JOB ID
      // track this jobId by adding a `pending` crypto Transaction object with the jobId on the object.
      const pendingTransaction = await Transaction.create({
        amount: Number.parseInt(response.data.job.data.amount),
        currency: Currency.GBT,
        order: orderId,
        receiver: toAddress,
        payer: config.fuseVegiCommunityCustodianWalletAddress,
        timestamp: moment().format(datetimeStrFormatExactForSQLTIMESTAMP),
        status: 'pending',
        remoteJobId: response.data.job._id,
      });
      
    })
    .catch((error) => {
      sails.log.error(`Fuse Minting Url ${mintUrl} with error: ${error}`);
      sails.log.error(`${error}`);
    });
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
