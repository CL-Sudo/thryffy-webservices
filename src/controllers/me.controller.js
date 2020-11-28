import R from 'ramda';
import { requestValidator } from '@validators';
import {
  Addresses,
  SalesOrders,
  Users,
  Reviews,
  Products,
  Preferences,
  Categories,
  Brands,
  Conditions
} from '@models';
import { hashPassword } from '@tools/bcrypt';
import formidable from 'formidable';
import { uploadProfilePicture, deleteExistingProfilePicture } from '@services';
import { paginate } from '@utils';
import { DELIVERY_STATUS } from '@constants';
import { shuffle } from 'lodash';
import { Op } from 'sequelize';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';

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

    if (!isValid) throw new Error('Invalid Old Password Provided');

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
      const { id } = req.user;

      const user = await Users.scope({ method: ['editProfile', id] }).findOne();

      await user.update(fields);

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

    const payload = await Reviews.scope('reviews').findAll({
      where: {
        sellerId: id
      }
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
    const { type, status, limit, offset } = req.query;

    const me = await Users.scope('order').findOne({ where: { id } });
    await me.getEarnings();
    await me.getTotalView();
    await me.getTotalLike();

    const getListings = async () => {
      try {
        const result = await Products.scope('listings').findAll({ where: { userId: id } });
        await Promise.all(
          R.map(async product => {
            await product.checkIsAddedToFavourite(id);
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

    const order = await SalesOrders.findOne({ where: { id: orderId } });
    await order.update({ deliveryStatus: DELIVERY_STATUS.COMPLETED });

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
    await profile.getReviewCount();
    await profile.getAverageRating();

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
    const user = await Users.findOne({ where: { id } });
    await user.update({ deviceToken });
    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    requestValidator(req);

    const { id } = req.user;
    const { categoryId, brandId, conditionId } = req.body;

    const groupId = (acc, { preferableId }) => acc.concat(preferableId);
    const toType = R.prop('preferableType');

    const currentPreferences = R.pipe(
      R.reduceBy(groupId, [], toType),
      R.merge({ condition: [], category: [], brand: [] })
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
    });

    await sequelize.transaction(async transaction => {
      await Preferences.bulkCreate(categoryObjs, transaction);

      await Preferences.bulkCreate(conditionObjs, transaction);

      await Preferences.bulkCreate(brandObjs, transaction);
    });

    const payload = await Preferences.findAndCountAll({
      where: { userId: id },
      include: [
        {
          model: Brands,
          as: 'brand'
        },
        {
          model: Conditions,
          as: 'condition'
        },
        {
          model: Categories,
          as: 'category'
        }
      ]
    });

    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};
