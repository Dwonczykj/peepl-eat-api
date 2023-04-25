//~ Use extension https://marketplace.visualstudio.com/items?itemName=MariusAlchimavicius.json-to-ts and convert https://stripe.com/docs/api/accounts to interface

const connect_standard_expample_response = {
  "id": "acct_1MxoUzKVoFHHJGSe",
  "object": "account",
  "business_profile": {
    "mcc": "5411",
    "name": "vegi ltd",
    "product_description": "We are a green goods platform that give our customers rewards points when they buy greener products through us. When customers pay for their baskets, they are immediately charged for the products.",
    "support_address": null,
    "support_email": null,
    "support_phone": "+447917787967",
    "support_url": null,
    "url": "https://vegiapp.co.uk"
  },
  "capabilities": {
    "card_payments": "active",
    "transfers": "active"
  },
  "charges_enabled": true,
  "controller": {
    "type": "application",
    "is_controller": true
  },
  "country": "GB",
  "created": 1681724245,
  "default_currency": "gbp",
  "details_submitted": true,
  "email": "joey@vegiapp.co.uk",
  "external_accounts": {
    "object": "list",
    "data": [
      {
        "id": "ba_1MyHu5KVoFHHJGSe1LTsSygS",
        "object": "bank_account",
        "account": "acct_1MxoUzKVoFHHJGSe",
        "account_holder_name": null,
        "account_holder_type": null,
        "account_type": null,
        "available_payout_methods": [
          "standard"
        ],
        "bank_name": "MONZO BANK LIMITED",
        "country": "GB",
        "currency": "gbp",
        "default_for_currency": true,
        "fingerprint": "JNN1m3fG0AgiU41w",
        "future_requirements": {
          "currently_due": [],
          "errors": [],
          "past_due": [],
          "pending_verification": []
        },
        "last4": "2650",
        "metadata": {},
        "requirements": {
          "currently_due": [],
          "errors": [],
          "past_due": [],
          "pending_verification": []
        },
        "routing_number": "04-00-04",
        "status": "new"
      }
    ],
    "has_more": false,
    "url": "/v1/accounts/acct_1MxoUzKVoFHHJGSe/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "metadata": {},
  "payouts_enabled": true,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": "Stripe"
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": "VEGIAPP",
      "statement_descriptor_prefix_kanji": null,
      "statement_descriptor_prefix_kana": null
    },
    "dashboard": {
      "display_name": "vegiapp.co.uk",
      "timezone": "Europe/London"
    },
    "payments": {
      "statement_descriptor": "VEGI APP",
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 7,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": 1681837436,
    "ip": "90.243.65.73",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
  },
  "type": "standard"
}



interface Tosacceptance2 {
  date: number;
  ip: string;
  user_agent: string;
}



interface Schedule {
  delay_days: number;
  interval: string;
}



interface Payouts {
  debit_negative_balances: boolean;
  schedule: Schedule;
  statement_descriptor?: any;
}

interface Payments {
  statement_descriptor: string;
  statement_descriptor_kana?: any;
  statement_descriptor_kanji?: any;
}

interface Dashboard {
  display_name: string;
  timezone: string;
}

interface Declineon {
  avs_failure: boolean;
  cvc_failure: boolean;
}

interface Cardpayments {
  decline_on: Declineon;
  statement_descriptor_prefix: string;
  statement_descriptor_prefix_kanji?: any;
  statement_descriptor_prefix_kana?: any;
}

interface Tosacceptance {
  date?: any;
  ip?: any;
}

interface Cardissuing {
  tos_acceptance: Tosacceptance;
}

interface Branding {
  icon?: any;
  logo?: any;
  primary_color?: any;
  secondary_color?: any;
}

interface Bacsdebitpayments {
  display_name: string;
}

interface Futurerequirements2 {
  alternatives: any[];
  current_deadline?: any;
  currently_due: any[];
  disabled_reason?: any;
  errors: any[];
  eventually_due: any[];
  past_due: any[];
  pending_verification: any[];
}

interface Metadata {
}

interface Futurerequirements {
  currently_due: any[];
  errors: any[];
  past_due: any[];
  pending_verification: any[];
}

interface Datum {
  id: string;
  object: string;
  account: string;
  account_holder_name?: any;
  account_holder_type?: any;
  account_type?: any;
  available_payout_methods: string[];
  bank_name: string;
  country: string;
  currency: string;
  default_for_currency: boolean;
  fingerprint: string;
  future_requirements: Futurerequirements;
  last4: string;
  metadata: Metadata;
  requirements: Futurerequirements;
  routing_number: string;
  status: string;
}

interface Externalaccounts {
  object: string;
  data: Datum[];
  has_more: boolean;
  url: string;
}

interface Controller {
  type: string;
  is_controller: boolean;
}

interface Capabilities {
  card_payments: string;
  transfers: string;
}

interface Businessprofile {
  mcc: string;
  name: string;
  product_description: string;
  support_address?: any;
  support_email?: any;
  support_phone: string;
  support_url?: any;
  url: string;
}

interface Settings {
  bacs_debit_payments: Bacsdebitpayments;
  branding: Branding;
  card_issuing: Cardissuing;
  card_payments: Cardpayments;
  dashboard: Dashboard;
  payments: Payments;
  payouts: Payouts;
  sepa_debit_payments: Metadata;
}

export interface StripeAccountType {
  id: string;
  object: string;
  business_profile: Businessprofile;
  capabilities: Capabilities;
  charges_enabled: boolean;
  controller: Controller;
  country: string;
  created: number;
  default_currency: string;
  details_submitted: boolean;
  email: string;
  external_accounts: Externalaccounts;
  future_requirements: Futurerequirements2;
  metadata: Metadata;
  payouts_enabled: boolean;
  requirements: Futurerequirements2;
  settings: Settings;
  tos_acceptance: Tosacceptance2;
  type: string;
}