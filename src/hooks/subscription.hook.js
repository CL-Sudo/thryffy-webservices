import { Packages, Products, Subscriptions, Users } from '@models';
import moment from 'moment';
import * as R from 'ramda';

/**
 *
 * @param {Number} packageId packageId to be subscribed
 * @param {Number} userId subscriber userId
 */
const decideExpiryDate = async (packageId, userId) => {
  try {
    const sub = await Subscriptions.findOne({
      where: { userId }
    });

    const subExpiryDate = moment(sub.expiryDate);
    const now = moment();
    const diff = now.diff(subExpiryDate, 'days');

    switch (true) {
      case packageId === sub.packageId && diff <= 0: {
        const exp = moment(subExpiryDate)
          .add(30, 'days')
          .format('YYYY-MM-DD HH:mm:ss');

        return Promise.resolve(exp);
      }

      case packageId === sub.packageId && diff > 0: {
        const exp = moment()
          .add(30, 'days')
          .format('YYYY-MM-DD HH:mm:ss');
        return Promise.resolve(exp);
      }

      case packageId !== sub.packageId: {
        const exp = moment()
          .add(30, 'days')
          .format('YYYY-MM-DD HH:mm:ss');
        return Promise.resolve(exp);
      }

      default:
        throw new Error('Oops, something is wrong!');
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 *
 * @param {Array} products
 * @param {Number} numberOfProductsToBeUnpublished
 * @returns [Products]
 */
const curateProductsToBeUnpublished = (products, numberOfProductsToBeUnpublished) => {
  const productsToBeUnpublished = [];
  const inStockProducts = products.filter(instance => !instance.isPurchased);

  /**
   * if the number of stock products is not enough, offset it with sold products
   */
  if (inStockProducts.length < numberOfProductsToBeUnpublished) {
    const diff = numberOfProductsToBeUnpublished - inStockProducts.length;

    const soldProducts = R.pipe(
      R.filter(o => o.isPurchased),
      R.sortBy(o => o.createdAt),
      R.take(diff)
    )(products);

    productsToBeUnpublished.push(soldProducts);
    productsToBeUnpublished.push(inStockProducts);
  } else {
    productsToBeUnpublished.push(
      R.take(numberOfProductsToBeUnpublished)(R.sortBy(o => o.createdAt)(inStockProducts))
    );
  }

  return R.flatten(productsToBeUnpublished);
};

Subscriptions.addHook('afterCreate', 'updateExpiryDate', async (instance, { transaction }) => {
  try {
    await Subscriptions.update(
      {
        expiryDate: moment()
          .add(1, 'months')
          .format('YYYY-MM-DD HH:mm:ss')
      },
      { where: { id: instance.id }, hooks: false, transaction }
    );
  } catch (e) {
    throw e;
  }
});

Subscriptions.addHook('afterUpdate', 'updateExpiryDate', async (instance, { transaction }) => {
  try {
    const { packageId, userId } = instance;
    if (instance.previous('packageId') !== packageId) {
      const expiryDate = await decideExpiryDate(packageId, userId);

      await Subscriptions.update(
        {
          expiryDate
        },
        { where: { id: instance.id }, hooks: false, transaction }
      );
    }
  } catch (e) {
    throw e;
  }
});

Subscriptions.addHook(
  'afterCreate',
  'updateSubscriptionValidity',
  async (instance, { transaction }) => {
    try {
      const user = await Users.findOne({ where: { id: instance.userId }, transaction });
      const hasValidSubscription = instance.checkHasValidSubscription();
      await user.update(
        {
          hasValidSubscription
        },
        { transaction }
      );
    } catch (e) {
      throw e;
    }
  }
);

Subscriptions.addHook(
  'afterUpdate',
  'updateSubscriptionValidity',
  async (instance, { transaction }) => {
    try {
      const user = await Users.findOne({ where: { id: instance.userId }, transaction });
      const hasValidSubscription = instance.checkHasValidSubscription();
      await user.update(
        {
          hasValidSubscription
        },
        { transaction }
      );
    } catch (e) {
      throw e;
    }
  }
);

Subscriptions.addHook('afterUpdate', 'manageListings', async (instance, { transaction }) => {
  try {
    const { packageId, userId } = instance;

    if (instance.previous('packageId') !== packageId) {
      const products = await Products.scope('countedInListing').findAll({
        where: { userId },
        transaction
      });

      const subscriptionPackage = await Packages.findOne({ where: { id: packageId }, transaction });

      if (products.length > subscriptionPackage.listing) {
        const diff = products.length - subscriptionPackage.listing;

        const productsToBeUnpublished = curateProductsToBeUnpublished(products, diff);

        await Products.update(
          { isPublished: false },
          { where: { id: productsToBeUnpublished.map(o => o.id) }, transaction }
        );
      }
    }
  } catch (e) {
    throw e;
  }
});
