const stripe_checkout_session_example = {
  id: 'cs_test_a16G7ySYu85shLqhIOFzmKxn42sPLA1cSGPqusk7uiDoYvoi4WM3zU4cqa',
  object: 'checkout.session',
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: null,
  amount_total: null,
  automatic_tax: {
    enabled: false,
    status: null,
  },
  billing_address_collection: null,
  cancel_url: 'https://example.com/cancel',
  client_reference_id: null,
  consent: null,
  consent_collection: null,
  created: 1682065880,
  currency: null,
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    shipping_address: null,
    submit: null,
  },
  customer: null,
  customer_creation: null,
  customer_details: {
    address: null,
    email: 'example@example.com',
    name: null,
    phone: null,
    tax_exempt: 'none',
    tax_ids: null,
  },
  customer_email: null,
  expires_at: 1682065880,
  invoice: null,
  invoice_creation: null,
  livemode: false,
  locale: null,
  metadata: {},
  mode: 'payment',
  payment_intent: 'pi_1EUmyo2x6R10KRrhUuJXu9m0',
  payment_link: null,
  payment_method_collection: null,
  payment_method_options: {},
  payment_method_types: ['card'],
  payment_status: 'unpaid',
  phone_number_collection: {
    enabled: false,
  },
  recovered_from: null,
  setup_intent: null,
  shipping_address_collection: null,
  shipping_cost: null,
  shipping_details: null,
  shipping_options: [],
  status: 'open',
  submit_type: null,
  subscription: null,
  success_url: 'https://example.com/success',
  total_details: null,
  url: null,
};

interface Phonenumbercollection {
  enabled: boolean;
}

interface Metadata {}

interface Customerdetails {
  address?: any;
  email: string;
  name?: any;
  phone?: any;
  tax_exempt: string;
  tax_ids?: any;
}

interface Customtext {
  shipping_address?: any;
  submit?: any;
}

interface Automatictax {
  enabled: boolean;
  status?: any;
}

export interface StripeCheckoutSessionType {
  id: string;
  object: string;
  after_expiration?: any;
  allow_promotion_codes?: any;
  amount_subtotal?: any;
  amount_total?: any;
  automatic_tax: Automatictax;
  billing_address_collection?: any;
  cancel_url: string;
  client_reference_id?: any;
  consent?: any;
  consent_collection?: any;
  created: number;
  currency?: any;
  currency_conversion?: any;
  custom_fields: any[];
  custom_text: Customtext;
  customer?: any;
  customer_creation?: any;
  customer_details: Customerdetails;
  customer_email?: any;
  expires_at: number;
  invoice?: any;
  invoice_creation?: any;
  livemode: boolean;
  locale?: any;
  metadata: Metadata;
  mode: string;
  payment_intent: string;
  payment_link?: any;
  payment_method_collection?: any;
  payment_method_options: Metadata;
  payment_method_types: string[];
  payment_status: string;
  phone_number_collection: Phonenumbercollection;
  recovered_from?: any;
  setup_intent?: any;
  shipping_address_collection?: any;
  shipping_cost?: any;
  shipping_details?: any;
  shipping_options: any[];
  status: string;
  submit_type?: any;
  subscription?: any;
  success_url: string;
  total_details?: any;
  url?: any;
}

