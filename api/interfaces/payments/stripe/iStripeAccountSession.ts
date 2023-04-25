const stripe_account_session_example = {
  "object": "account_session",
  "account": "acct_1MzFJiLYpbHp2TYH",
  "client_secret": "_NkkpofF7si9bx6biMLtsGdUvJhkSpFbGIOtQshSUThU3Zyp",
  "expires_at": 1682065782,
  "livemode": false
};

export interface StripeAccountSessionType {
  object: string;
  account: string;
  client_secret: string;
  expires_at: number;
  livemode: boolean;
}