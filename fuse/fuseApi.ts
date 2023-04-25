import axios from 'axios';

let config = {
  fuseApiV2Url: '',
  fuseApiJwt: '',
  fuseVegiCommunityGreenPointTokenAddress: '',
  fuseVegiCommunityGreenPointNetworkType: 'fuse',
};
if (process.env['local'] || process.env['local.js']) {
  // eslint-disable-next-line no-console
  console.log(`Loading config from local env vars for config/firebaseAdmin.ts`);
  const localConfigFromDotEnv = JSON.parse(
    Buffer.from(process.env['local'] || process.env['local.js'], 'base64').toString()
  );
  config = localConfigFromDotEnv.config.custom;
}

const urlBase = config['fuseApiV2Url'];
const adminJwtToken = config['fuseApiJwt'];

export function generateCorrelationId () {
  return '_' + Math.random().toString(36).substr(2, 9);
}

export async function mintTokensAndSendToken ({
  toAddress,
  amount,
  correlationId
}) {
  const body = {
    fuseVegiCommunityGreenPointTokenAddress: config['fuseVegiCommunityGreenPointTokenAddress'],
    fuseVegiCommunityGreenPointNetworkType: config['fuseVegiCommunityGreenPointNetworkType'],
    correlationId,
    amount,
    toAddress
  };
  return axios.post(`${urlBase}/admin/tokens/mint`, body, {
    headers: { Authorization: `Bearer ${adminJwtToken}` }
  });
}

// module.exports = {
//   mintTokensAndSendToken,
//   generateCorrelationId
// };
