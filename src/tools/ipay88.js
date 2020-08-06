/* eslint-disable no-param-reassign */
/* eslint-disable no-useless-escape */
import { SHA256 } from '@tools/sha256';
import * as Config from '@configs';
import { parseMoney } from '@utils';

const { ipay88: iPay88 } = Config;

export const generateResponseSignature = ({ PaymentId, RefNo, Amount, Status } = {}) => {
  const hashString = iPay88.merchantKey + iPay88.merchantCode + PaymentId + RefNo + Amount.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '') + Status;
  return SHA256(hashString);
};

export const generateRequestSignature = ({ refNo, amount, currency }) => {
  amount = parseMoney(amount);
  const hashString = iPay88.merchantKey + iPay88.merchantCode + refNo + amount.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '') + currency;
  return SHA256(hashString);
};

export const paymentMethods = {
  2: 'Credit Card',
  6: 'Maybank2U',
  8: 'Alliance Online',
  10: 'AmOnline',
  14: 'RHB Online',
  15: 'Hong Leong Online',
  20: 'CIMB Click',
  22: 'Web Cash',
  31: 'Public Bank Online',
  48: 'PayPal (MYR)',
  55: 'Credit Card (MYR) Pre-Auth',
  102: 'Bank Rakyat Internet Banking',
  103: 'Affin Online',
  122: 'Pay4Me (Delay payment)',
  124: 'BSN Online',
  134: 'Bank Islam',
  152: 'UOB',
  163: 'Hong Leong PEx+ (QR Payment)',
  166: 'Bank Muamalat',
  167: 'OCBC',
  168: 'Standard Chartered Bank',
  173: 'CIMB Virtual Account (Delay payment)',
  198: 'HSBC Online Banking',
  199: 'Kuwait Finance House',
  210: 'Boost Wallet',
  243: 'VCash'
};
