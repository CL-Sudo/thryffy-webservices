import FavouriteProducts from '@models/favourite_products.model';
import Notifications from '@models/notifications.model';
import Users from '@models/users.model';
import { FAVOURITE } from '@templates/notification.template';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import MODEL_CONSTANT from '@constants/model.constant';
import { sendCloudMessage } from '@services/notification.service';
import Products from '@models/products.model';

FavouriteProducts.addHook('afterCreate', 'pushNotification', async instance => {
  try {
    const product = await Products.findOne({
      where: { id: instance.productId },
      include: [{ model: Users, as: 'seller' }]
    });
    const user = await Users.findOne({ where: { id: instance.userId } });

    const notification = await Notifications.create({
      title: FAVOURITE.ADD(user.username || user.fullName),
      type: NOTIFICATION_TYPE.ITEM_LIKED,
      notifierId: product.userId,
      actorId: instance.userId,
      notifiableId: instance.productId,
      notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.PRODUCT
    });

    const data = await Notifications.findOne({ where: { id: notification.id } });

    await sendCloudMessage({
      title: FAVOURITE.ADD(user.username || user.fullName),
      token: product.seller.deviceToken,
      data
    });
  } catch (e) {
    throw e;
  }
});
