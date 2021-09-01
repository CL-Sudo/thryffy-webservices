import Followings from '@models/followings.model';
import Products from '@models/products.model';
import Users from '@models/users.model';
import { PRODUCT } from '@templates/notification.template';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import MODEL_CONSTANT from '@constants/model.constant';
import { sendCloudMessage } from '@services/notification.service';
import Notifications from '@models/notifications.model';

Products.addHook('afterUpdate', 'remindFollowers', async (instance, { transaction }) => {
  try {
    if (!instance.previous('thumbnail') && instance.thumbnail) {
      const operations = [];

      const followings = await Followings.findAll({
        where: { sellerId: instance.userId },
        include: [
          { model: Users, as: 'follower' },
          { model: Users, as: 'seller' }
        ],
        transaction
      });

      followings.forEach(following => {
        operations.push(
          new Promise(async (resolve, reject) => {
            try {
              const notification = await Notifications.create(
                {
                  title: PRODUCT.NEW_PRODUCT_ADDED(
                    following.seller.username || following.seller.fullName
                  ),
                  type: NOTIFICATION_TYPE.NEW_ITEM_ADDED,
                  notifierId: following.follower.id,
                  actorId: following.seller.id,
                  notifiableId: instance.id,
                  notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.PRODUCT,
                  deeplink: `thryffy://users/${following.seller.id}`
                },
                { transaction }
              );

              const data = await Notifications.findOne({
                where: { id: notification.id },
                transaction
              });

              await sendCloudMessage({
                title: PRODUCT.NEW_PRODUCT_ADDED(
                  following.seller.username || following.seller.fullName
                ),
                token: following.follower.deviceToken,
                data
              });

              return resolve();
            } catch (e) {
              return reject(e);
            }
          })
        );
      });

      await Promise.all(operations);
    }
  } catch (e) {
    throw e;
  }
});
