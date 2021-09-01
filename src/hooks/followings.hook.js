import Followings from '@models/followings.model';
import Notifications from '@models/notifications.model';
import Users from '@models/users.model';
import { FOLLOWING } from '@templates/notification.template';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import MODEL_CONSTANT from '@constants/model.constant';
import { sendCloudMessage } from '@services/notification.service';

Followings.addHook('afterCreate', 'pushNotification', async (instance, { transaction }) => {
  try {
    const follower = await Users.findOne({ where: { id: instance.followerId }, transaction });
    const seller = await Users.findOne({ where: { id: instance.sellerId }, transaction });

    const notification = await Notifications.create(
      {
        title: FOLLOWING.BEING_FOLLOWED(follower.username || follower.fullName),
        type: NOTIFICATION_TYPE.BEING_FOLLOWED,
        notifierId: instance.sellerId,
        actorId: instance.followerId,
        notifiableId: instance.followerId,
        notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.USER,
        deeplink: `thryffy://users/${follower.id}`
      },
      { transaction }
    );

    const data = await Notifications.findOne({ where: { id: notification.id }, transaction });

    await sendCloudMessage({
      title: FOLLOWING.BEING_FOLLOWED(follower.username || follower.fullName),
      token: seller.deviceToken,
      data
    });
  } catch (e) {
    throw e;
  }
});
