/**
 *
 * @param {String} verificationCode
 */
export const SMSVerifcation = verificationCode =>
  `Your verification code is ${verificationCode}. This code will be expired in 10 minutes.`;
