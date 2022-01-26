export const BUYER_DISPUTE = orderId => `Buyer - ${orderId}`;

export const SALE_MADE_SELLER = {
  TITLE: 'Cha-Ching! You made a sale!',
  DESCRIPTION: 'Please input the tracking number and mark order as shipped.'
  // DESCRIPTION:
  //   'Please input the tracking number and mark order as shipped. And also remember to take clear photos of your item with the shipping label as your reference and ship your item in 48 Hours.'
};

export const SALE_REVIEWED = "You've received a review";

export const DISPUTE_OPENED_TITLE = "It seems like a dispute has been opened. Let's fix this!";

export const DISPUTE_OPENED_DESCRIPTIION =
  'You have 48 hours to provide information for the dispute';

export const MARKED_AS_SHIPPED = 'Your product just got shipped!';

export const SUBSCRIPTION_REMINDER = {
  DAYS_BEFORE: expiryDate =>
    `Your subscription is expiring on ${expiryDate}, please renew your subscription.`,

  EXPIRED: 'Your subscription has expired'
};

export const PUBLICATION = {
  UNPUBLISHED:
    'Oh no! Your item got taken down. Check our listing terms & conditions to see what went wrong.'
};

export const DELIVERY = {
  COMPLETED: orderRef => `Your order ${orderRef} has just delivered successfully!`,

  NOT_DELIVERED_WITHIN_MAX_HOUR: {
    BUYER:
      "It seems that the item you ordered is unavailable. Don't worry we will be sending you a full refund."
  }
};

export const PAYMENT = {
  ORDER: {
    SUCCESS: orderRef =>
      `Success! Payment for your order ${orderRef} is successfully processed, thank you for shopping with us!`,

    FAILED:
      'Oops, something wrong while processing payment for your order. Please contact your bank for further validation.'
  }
};

export const REMIND_TAKE_PHOTO =
  'Please take clear photos of your item with the shipping label as your reference';

export const FOLLOWING = {
  BEING_FOLLOWED: followerName => `${followerName} just followed you.`
};

export const FAVOURITE = {
  ADD: username => `${username} likes your item.`
};

export const PRODUCT = {
  NEW_PRODUCT_ADDED: sellerName => `${sellerName} uploaded a new item.`
};
