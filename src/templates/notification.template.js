export const BUYER_DISPUTE = orderId => `Buyer - ${orderId}`;

export const SALE_MADE_SELLER = {
  TITLE: 'Cha-Ching! You made a sale!',
  DESCRIPTION: 'Please input the tracking number and mark order as shipped.'
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
  COMPLETED: orderRef => `Your order ${orderRef} has just delivered successfully!`
};
