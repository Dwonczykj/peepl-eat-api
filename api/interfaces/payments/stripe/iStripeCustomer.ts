

const example = {
  id: 'cus_NlfeC0QPrKLufT',
  object: 'customer',
  address: null,
  balance: 0,
  created: 1682277041,
  currency: 'gbp',
  default_source: null,
  delinquent: false,
  description: null,
  discount: null,
  email: null,
  invoice_prefix: 'CDF87F9',
  invoice_settings: {
    custom_fields: null,
    default_payment_method: null,
    footer: null,
    rendering_options: null,
  },
  livemode: false,
  metadata: {},
  name: null,
  phone: null,
  preferred_locales: [],
  shipping: null,
  tax_exempt: 'none',
  test_clock: null,
};

interface Metadata {}

interface Invoicesettings {
  custom_fields?: any;
  default_payment_method?: any;
  footer?: any;
  rendering_options?: any;
}

export interface StripeCustomerType {
  id: string;
  object: string;
  address?: any;
  balance: number;
  created: number;
  currency: string;
  default_source?: any;
  delinquent: boolean;
  description?: any;
  discount?: any;
  email?: any;
  invoice_prefix: string;
  invoice_settings: Invoicesettings;
  livemode: boolean;
  metadata: Metadata;
  name?: any;
  phone?: any;
  preferred_locales: any[];
  shipping?: any;
  tax_exempt: string;
  test_clock?: any;
}