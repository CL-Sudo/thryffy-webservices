export * from './configs';
export const authTokenName = `${process.env.GLOBAL_APP_NAME}.at`;
export const refreshTokenName = `${process.env.GLOBAL_APP_NAME}.rt`;

export const adminAuthTokenName = `${process.env.GLOBAL_APP_NAME}.admin.at`;
export const adminRefreshTokenName = `${process.env.GLOBAL_APP_NAME}.admin.rt`;
// export default {
//   superSecret: 'shutupandberich8888', // jwt secret,
//   authTokenName: `${process.env.GLOBAL_APP_NAME}.at`,
//   adminAuthTokenName: `${process.env.GLOBAL_APP_NAME}.admin.at`,
//   merchantAuthTokenName: `${process.env.GLOBAL_APP_NAME}.merchant.at`,
//   refreshTokenName: `${process.env.GLOBAL_APP_NAME}.rt`,
//   adminRefreshTokenName: `${process.env.GLOBAL_APP_NAME}.admin.rt`,
//   merchantRefreshTokenName: `${process.env.GLOBAL_APP_NAME}.merchant.rt`,
//   jwtExpireIn: '1hr',
//   bcrypt: {
//     saltRounds: 10
//   }
// };
