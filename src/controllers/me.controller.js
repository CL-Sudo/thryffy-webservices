import R from 'ramda';
import moment from 'moment';
import * as _ from 'lodash';

import { requestValidator } from '@validators';
import {
  Addresses,
  SalesOrders,
  Users,
  OrderItems,
  Reviews,
  Products,
  Preferences,
  Subscriptions,
  Packages,
  Otps,
  Notifications,
  Countries
} from '@models';

import { hashPassword } from '@tools/bcrypt';

import formidable from 'formidable';

import { uploadProfilePicture, deleteExistingProfilePicture } from '@services';
import {
  generateTopicName,
  sendCloudMessage,
  subscribeTokenToTopic
} from '@services/notification.service';

import { paginate } from '@utils';
import { generateOTP as getOtp } from '@utils/auth.util';

import { DELIVERY_STATUS } from '@constants';
import NOTIFICATION_CONSTANT from '@constants/notification.constant';
import { defaultExcludeFields } from '@constants/sequelize.constant';

import { Op } from 'sequelize';

import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { sendSMS } from '@services/sms.service';

import { SMSVerifcation } from '@templates/sms.template';

import { Billplz } from '@services/billplz.service';
import { DELIVERY } from '@templates/notification.template';

import NOTIFIABLE_TYPE from '@constants/model.constant';

const nodeEnv = process.env.NODE_ENV;
const serverUrl = process.env.SERVER_URL;
const ngrokUrl = process.env.NGROK_URL;

export const addAddress = async (req, res, next) => {
  try {
    requestValidator(req);

    const { isDefault } = req.body;
    const { id } = req.user;

    if (isDefault === true) {
      const addresses = await Addresses.count({ where: { userId: id } });
      if (addresses > 0) {
        await Addresses.update({ isDefault: false }, { where: { userId: id, isDefault: true } });
      }
    }

    const address = await Addresses.create({
      ...req.body,
      userId: id
    });

    const count = await Addresses.count({ where: { userId: id } });

    if (count === 1) await address.update({ isDefault: true });

    const addresses = await Addresses.findAndCountAll({ where: { userId: id } });

    return res.status(200).json({
      message: 'success',
      payload: addresses
    });
  } catch (e) {
    return next(e);
  }
};

export const listAddress = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { limit, offset } = req.query;
    const addresses = await Addresses.findAndCountAll({
      raw: true,
      where: { userId: id },
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });
    return res.status(200).json({
      message: 'success',
      payload: addresses
    });
  } catch (e) {
    return next(e);
  }
};

export const removeAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { id } = req.user;

    const address = await Addresses.findOne({ where: { id: addressId } });

    if (R.isNil(address)) {
      throw new Error('Invalid addressId given, no address found');
    }

    await address.destroy({ force: true });

    const addresses = await Addresses.findAndCountAll({ raw: true, where: { userId: id } });

    return res.status(200).json({
      message: 'success',
      payload: addresses
    });
  } catch (e) {
    return next(e);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    requestValidator(req);

    const { addressId } = req.params;
    const { id } = req.user;
    const { isDefault } = req.body;

    const address = await Addresses.findOne({ where: { id: addressId } });
    if (R.isNil(address)) {
      throw new Error('Invalid addressId given');
    }

    if (address.userId !== id) throw new Error('This address does not belong to you.');

    if (isDefault) {
      await Addresses.update(
        { isDefault: false },
        { where: { userId: id, isDefault: true, id: { [Op.ne]: addressId } } }
      );
    }

    await address.update(req.body);

    const addresses = await Addresses.findAndCountAll({ raw: true, where: { userId: id } });

    return res.status(200).json({
      message: 'success',
      payload: addresses
    });
  } catch (e) {
    return next(e);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { id } = req.user;
    await Addresses.update({ isDefault: false }, { where: { userId: id } });
    const address = await Addresses.findOne({ where: { id: addressId } });
    if (R.isNil(address)) {
      throw new Error('Invalid addressId given');
    }
    await address.update({ isDefault: R.not(address.isDefault) });

    const addresses = await Addresses.findAndCountAll({ raw: true, where: { userId: id } });

    return res.status(200).json({
      message: 'success',
      payload: addresses
    });
  } catch (e) {
    return next(e);
  }
};

export const getOneAddress = async (req, res, next) => {
  try {
    requestValidator(req);
    const { addressId } = req.params;
    const address = await Addresses.findOne({
      where: { id: addressId },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'deletedAt', 'createdBy', 'updatedBy', 'deletedBy']
      }
    });
    return res.status(200).json({
      message: 'success',
      payload: address
    });
  } catch (e) {
    return next(e);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await SalesOrders.scope({ method: ['orderDetails', orderId] }).findOne();

    if (R.isNil(order)) throw new Error('Invalid orderId given.');
    await order.getItemQuantity();
    await order.checkHasReviewed();
    const { seller } = order.orderItems[0].product;
    const payload = R.assoc('seller', seller)(order.dataValues);

    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    return next(e);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    requestValidator(req);
    const { id } = req.user;
    const { oldPassword, password } = req.body;

    const user = await Users.unscoped().findOne({
      where: { id }
    });

    const isValid = await user.comparePassword(oldPassword);

    if (!isValid) throw new Error('Please input your correct old password.');

    if (oldPassword === password) {
      throw new Error('Please input a different password.');
    }

    user.update({ password: hashPassword(password) });

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const updateProfile = async (req, res, next) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      const { profilePicture } = files;
      const { username, email } = fields;
      const { id } = req.user;

      const userById = await Users.findOne({ where: { id } });
      // if (
      //   userById.username !== null &&
      //   userById.username.length > 0 &&
      //   username !== userById.username
      // ) {
      //   throw new Error('You are not allowed to change your username');
      // }

      if (username) {
        const userByUsername = await Users.findOne({ where: { username } });
        if (userByUsername && id !== userByUsername.id) {
          throw new Error(
            'Username requested is not available anymore, please try again with another username.'
          );
        }
      }

      if (!email || (email && email.length < 1)) {
        throw new Error('Email cannot be empty');
      }

      const userByEmail = await Users.findOne({ where: { email } });
      if (!R.isNil(userByEmail) && userByEmail.id !== id) {
        throw new Error('This email is not available.');
      }

      const user = await Users.findOne({ where: { id } });

      await user.update({ ..._.omit(fields, ['username']) });

      if (profilePicture) {
        await deleteExistingProfilePicture(id);
        await uploadProfilePicture({
          userId: id,
          profilePicture
        });
      }

      await user.reload();

      return res.status(200).json({
        message: 'success',
        payload: user
      });
    } catch (e) {
      return next(e);
    }
  });
};

export const getReview = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { limit, offset } = req.query;

    const getAverageRating = reviews => {
      const getRatings = R.map(R.prop('rating'));
      const getAverage = R.ifElse(R.isEmpty, R.always(0), R.mean);

      const average = R.pipe(getRatings, getAverage)(reviews);
      return average;
    };

    const payload = await Reviews.findAll({
      where: {
        sellerId: id
      },
      attributes: { exclude: ['updatedAt', 'deletedAt', 'updatedBy', 'deletedBy'] },
      include: [
        {
          model: SalesOrders,
          as: 'order',
          attributes: { exclude: defaultExcludeFields },
          include: [
            {
              model: OrderItems,
              as: 'orderItems',
              attributes: { exclude: defaultExcludeFields },
              include: [
                {
                  model: Products,
                  as: 'product',
                  attributes: { exclude: defaultExcludeFields }
                }
              ]
            }
          ]
        },
        {
          model: Users,
          as: 'buyer',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ]
    });

    const averageRating = getAverageRating(payload);

    return res.status(200).json({
      message: 'success',
      payload: {
        averageRating,
        count: payload.length,
        rows: paginate(limit)(offset)(payload)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { type, status, limit, offset, unsold = 'false' } = req.query;

    const me = await Users.scope('order').findOne({ where: { id } });
    await me.getEarnings();
    await me.getTotalView();
    await me.getTotalLike();

    const getListings = async () => {
      try {
        const where =
          unsold === 'false'
            ? { userId: id, isPublished: true }
            : { userId: id, isPurchased: false, isPublished: true };
        const result = await Products.scope('listings').findAll({ where });
        await Promise.all(
          R.map(async product => {
            await product.getExtraFields(id);
          })(result)
        );
        return Promise.resolve(result);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const getSoldItems = async () => {
      try {
        const result = await SalesOrders.scope({ method: ['sold', id, status] }).findAll();
        return Promise.resolve(result);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const getBoughtItems = async () => {
      try {
        const result = await SalesOrders.scope({ method: ['bought', id, status] }).findAll();
        return Promise.resolve(result);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const result = R.cond([
      [R.equals('LISTINGS'), R.always(await getListings())],
      [R.equals('SOLD'), R.always(await getSoldItems())],
      [R.equals('BOUGHT'), R.always(await getBoughtItems())]
    ])(R.toUpper(type));

    const payload = R.cond([
      [R.always(R.equals('LISTINGS', R.toUpper(type))), R.assoc('me', me.dataValues)],
      [R.T, R.identity]
    ])({
      count: R.length(result),
      rows: paginate(limit)(offset)(result)
    });

    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    return next(e);
  }
};

export const confirmOrderReceived = async (req, res, next) => {
  try {
    requestValidator(req);

    const { orderId } = req.body;

    const order = await SalesOrders.findOne({
      where: { id: orderId },
      include: [
        {
          model: Users,
          as: 'buyer'
        },
        {
          model: Users,
          as: 'seller'
        }
      ]
    });
    await order.update({ deliveryStatus: DELIVERY_STATUS.COMPLETED });

    const notification = await Notifications.create({
      title: DELIVERY.COMPLETED(order.orderRef),
      type: NOTIFICATION_CONSTANT.DELIVERY_COMPLETED,
      actorId: order.buyer.id,
      notifierId: order.seller.id,
      notifiableType: NOTIFIABLE_TYPE.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER,
      notifiableId: order.id
    });

    const data = await Notifications.findOne({ where: { id: notification.id } });

    await sendCloudMessage({
      title: DELIVERY.COMPLETED(order.orderRef),
      token: order.seller.deviceToken,
      data
    });

    const payload = await SalesOrders.scope({ method: ['orderDetails', order.id] }).findOne();
    await payload.getExtraFields();

    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    return next(e);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const { id } = req.user;

    const profile = await Users.scope('order').findOne({ where: { id } });
    await profile.getExtraFields();

    return res.status(200).json({
      message: 'success',
      payload: profile
    });
  } catch (e) {
    return next(e);
  }
};

// export const recommendProducts = async (req, res, next) => {
//   try {
//     const { id } = req.user;
//     const { limit, offset } = req.query;

//     const user = await Users.findOne({
//       attributes: ['id'],
//       where: { id },
//       include: [
//         {
//           model: Products,
//           as: 'viewedProducts',
//           attributes: ['categoryId'],
//           through: { attributes: [] }
//         }
//       ]
//     });

//     const parseObjectToArr = obj =>
//       Object.keys(obj).map(key => ({
//         categoryId: key,
//         length: obj[key].length
//       }));
//     const groupByCategoryId = R.groupBy(product => product.categoryId);
//     const sortByLength = R.sortBy(obj => obj.length);

//     const topThreeMostViewedCategories = R.pipe(
//       groupByCategoryId,
//       parseObjectToArr,
//       sortByLength,
//       R.reverse,
//       R.take(3),
//       R.map(R.prop('categoryId'))
//     )(user.viewedProducts);

//     const products = await Products.scope('default').findAll({
//       where: { categoryId: topThreeMostViewedCategories }
//     });

//     const result = shuffle(products);

//     return res.status(200).json({
//       message: 'success',
//       payload: {
//         count: products.length,
//         rows: paginate(limit)(offset)(result)
//       }
//     });
//   } catch (e) {
//     return next(e);
//   }
// };

export const updateDeviceToken = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { deviceToken } = req.body;
    const user = await Users.findOne({
      where: { id },
      include: [{ model: Countries, as: 'country' }]
    });
    await user.update({ deviceToken });

    await subscribeTokenToTopic(
      deviceToken,
      generateTopicName(NOTIFICATION_CONSTANT.MARKETING, user.country.name)
    );

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    // requestValidator(req);

    const { id } = req.user;
    const { categoryId = [], brandId = [], conditionId = [], sizeId = [] } = req.body;

    const groupId = (acc, { preferableId }) => acc.concat(preferableId);
    const toType = R.prop('preferableType');

    const currentPreferences = R.pipe(
      R.reduceBy(groupId, [], toType),
      R.merge({ condition: [], category: [], brand: [], size: [] })
    )(
      await Preferences.findAll({
        where: { userId: id }
      })
    );

    const intersectedCategoryIds = R.intersection(categoryId)(currentPreferences.category);
    const categoryIdsToBeDeleted = R.without(intersectedCategoryIds)(currentPreferences.category);
    const categoryIdsToBeAdded = R.without(intersectedCategoryIds)(categoryId);

    const intersectedbrandIds = R.intersection(brandId)(currentPreferences.brand);
    const brandIdsToBeDeleted = R.without(intersectedbrandIds)(currentPreferences.brand);
    const brandIdsToBeAdded = R.without(intersectedbrandIds)(brandId);

    const intersectedconditionIds = R.intersection(conditionId)(currentPreferences.condition);
    const conditionIdsToBeDeleted = R.without(intersectedconditionIds)(
      currentPreferences.condition
    );
    const conditionIdsToBeAdded = R.without(intersectedconditionIds)(conditionId);

    const intersectedSizeIds = R.intersection(sizeId)(currentPreferences.size);
    const sizeIdsToBeDeleted = R.without(intersectedSizeIds)(currentPreferences.size);
    const sizeIdsToBeAdded = R.without(intersectedSizeIds)(sizeId);

    const categoryObjs = R.map(cId => ({
      userId: id,
      preferableId: cId,
      preferableType: 'category'
    }))(categoryIdsToBeAdded);

    const brandObjs = R.map(bId => ({
      userId: id,
      preferableId: bId,
      preferableType: 'brand'
    }))(brandIdsToBeAdded);

    const conditionObjs = R.map(condId => ({
      userId: id,
      preferableId: condId,
      preferableType: 'condition'
    }))(conditionIdsToBeAdded);

    const sizeObjs = R.map(sId => ({
      userId: id,
      preferableId: sId,
      preferableType: 'size'
    }))(sizeIdsToBeAdded);

    await sequelize.transaction(async transaction => {
      await Preferences.destroy({
        where: { userId: id, preferableId: conditionIdsToBeDeleted, preferableType: 'condition' },
        force: true,
        transaction
      });

      await Preferences.destroy({
        where: { userId: id, preferableId: categoryIdsToBeDeleted, preferableType: 'category' },
        force: true,
        transaction
      });

      await Preferences.destroy({
        where: { userId: id, preferableId: brandIdsToBeDeleted, preferableType: 'brand' },
        force: true,
        transaction
      });

      await Preferences.destroy({
        where: { userId: id, preferableId: sizeIdsToBeDeleted, preferableType: 'size' },
        force: true,
        transaction
      });
    });

    await sequelize.transaction(async transaction => {
      await Preferences.bulkCreate(categoryObjs, transaction);

      await Preferences.bulkCreate(conditionObjs, transaction);

      await Preferences.bulkCreate(brandObjs, transaction);

      await Preferences.bulkCreate(sizeObjs, transaction);
    });

    const payload = await Preferences.findAndCountAll({
      where: { userId: id }
    });

    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};

export const getPreferences = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { limit, offset } = req.params;

    const preferences = await Preferences.findAll({
      where: { userId: id },
      limit: Number(limit) || null,
      offest: Number(offset) || null
    });

    const getPreferableTypeObject = (condition, brand, category, size) =>
      R.cond([
        [() => R.isNil(brand) && R.isNil(category) && R.isNil(size), () => condition],
        [() => R.isNil(condition) && R.isNil(category) && R.isNil(size), () => brand],
        [() => R.isNil(condition) && R.isNil(brand) && R.isNil(size), () => category],
        [() => R.isNil(condition) && R.isNil(brand) && R.isNil(category), () => size]
      ])();

    const groupPreferenceType = (acc, { condition, brand, category, size }) =>
      acc.concat(getPreferableTypeObject(condition, brand, category, size));

    const payload = R.pipe(
      R.reduceBy(groupPreferenceType, [], R.prop('preferableType')),
      R.merge({ condition: [], brand: [], category: [], size: [] })
    )(preferences);

    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};

export const getOneSubscription = async (req, res, next) => {
  try {
    requestValidator(req);
    const { id: userId } = req.user;
    const payload = await Subscriptions.findOne({
      where: { userId },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'deletedAt', 'createdBy', 'updatedBy', 'deletedBy']
      },
      include: [
        {
          model: Packages,
          as: 'package'
        }
      ]
    });
    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    return next(e);
  }
};

export const generateOtp = async (req, res, next) => {
  try {
    const { phoneCountryCode, phoneNumber } = req.body;

    const otp = getOtp();
    const otpValidity = moment().add(10, 'minutes');

    await sequelize.transaction(async transaction => {
      const existingOTP = await Otps.findOne({
        where: { phoneCountryCode, phoneNumber },
        transaction
      });

      if (!existingOTP) {
        await Otps.create({ otp, otpValidity, phoneCountryCode, phoneNumber }, { transaction });
      } else {
        await existingOTP.update({ otp, otpValidity, isVerified: false }, { transaction });
      }

      await sendSMS(`${phoneCountryCode}${phoneNumber}`, SMSVerifcation(otp));
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const updateBankDetails = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await Users.findOne({ where: { id } });
    await user.update(req.body);

    await user.reload();

    return res.status(200).json({ message: 'success', payload: user });
  } catch (e) {
    return next(e);
  }
};

export const updateIdentityNo = async (req, res, next) => {
  try {
    requestValidator(req);
    const { id } = req.user;
    const { identityNo } = req.body;

    const user = await Users.findOne({ where: { id } });
    await user.update({ identityNo });
    await user.reload();
    return res.status(200).json({ message: 'success', payload: user });
  } catch (e) {
    return next(e);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { otp, phoneCountryCode, phoneNumber } = req.body;
    const existingOTP = await Otps.findOne({ where: { phoneCountryCode, phoneNumber } });

    if (otp !== existingOTP.otp) {
      throw new Error(
        `Sorry, we couldn't verify your phone number (${phoneCountryCode} ${phoneNumber}.)`
      );
    }

    if (new Date() > existingOTP.otpValidity) {
      throw new Error('OTP expired, please resend again');
    }

    await existingOTP.update({ isVerified: true });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const addCreditCard = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const user = await Users.findOne({ where: { id: userId } });
    const billplzService = new Billplz();

    const callbackUrl = `${
      nodeEnv === 'DEV' ? ngrokUrl : serverUrl
    }/api/publics//billplz/create-credit-card/callback`;

    const response = await billplzService.createCreaditCard({
      name: `${user.fullName}`,
      email: user.email,
      phone: user.completePhoneNumber,
      callbackUrl
    });
    return res.status(200).json({ message: 'success', payload: response.data });
  } catch (e) {
    return next(e);
  }
};
