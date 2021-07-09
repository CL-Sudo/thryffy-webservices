export default {
  DISPUTE_RESPONDED_EMAIL: 'd-7ad74d14c0ba4b8dbc14c0648e35a9cc',

  DISPUTE_CREATED_EMAIL: 'd-74ccfa757ebc4896b4413adcbb404e58',

  INVOICE_TEMPLATE: 'd-c42a5876dc6449dcb130e9afdf5941dc',

  SUBSCRIPTION_INVOICE: 'd-eae4662b8605449ab8e1e2196df187f3',

  WELCOME_EMAIL: 'd-3aa32b9d01f247bfb25f9b5f66419bd7',

  CONTACT_US: 'd-7e7e988c5c014604b6552ab7500e6c51',

  SELLER_SHIPPING_REMINDER: 'd-dbc3895597524074b0e827f151cf58e3'
};

export const MESSAGE_FOR_EMAIL_REMINDER_TO_SHIP = {
  LEFT_48_HOURS: parcelName =>
    `Congratulations! Ship your item in 48 Hours. Head to Pos Laju and purchase a ${parcelName}.`,

  LEFT_24_HOURS: parcelName =>
    `Quick Reminder to ship your item in 24 Hours. Head to Pos Laju and purchase a ${parcelName}.`,

  LEFT_12_HOURS: parcelName =>
    `Don’t miss on your sale, ship your item in 12 Hours. Head to Pos Laju and purchase a ${parcelName}.`
};
