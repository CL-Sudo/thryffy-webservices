import R from 'ramda';
import { requestValidator } from '@validators';
import { Addresses, SalesOrders, Users, Reviews, Products } from '@models';
import { hashPassword } from '@tools/bcrypt';
import formidable from 'formidable';
import { uploadProfilePicture, deleteExistingProfilePicture } from '@services';
import { paginate } from '@utils';

export const addAddress = async (req, res, next) => {
  try {
    requestValidator(req);
    const { id } = req.user;
    await Addresses.create({
      ...req.body,
      userId: id
    });
    return res.status(200).json({
      message: 'success'
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

    const address = await Addresses.findOne({ where: { id: addressId } });

    if (R.isNil(address)) {
      throw new Error('Invalid addressId given, no address found');
    }

    address.destroy({ force: true });

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    requestValidator(req);

    const { addressId } = req.params;

    const address = await Addresses.findOne({ where: { id: addressId } });
    if (R.isNil(address)) {
      throw new Error('Invalid addressId given');
    }

    address.update(req.body);

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const address = await Addresses.findOne({ where: { id: addressId } });
    if (R.isNil(address)) {
      throw new Error('Invalid addressId given');
    }
    address.update({ isDefault: R.not(address.isDefault) });
    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const payload = await SalesOrders.scope({ method: ['orderDetails', orderId] }).findOne();

    if (R.isNil(payload)) throw new Error('Invalid orderId given.');

    await payload.getItemQuantity();

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

      user.update(fields);

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

    const payload = await Reviews.scope('reviews').findAndCountAll({
      where: {
        sellerId: id
      },
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    const averageRating = getAverageRating(payload.rows);

    return res.status(200).json({
      message: 'success',
      payload: {
        averageRating,
        ...payload
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
    await me.getExtraFields();

    const getListings = async () => {
      try {
        const result = await Products.scope('listings').findAll({ where: { userId: id } });
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

    return res.status(200).json({
      message: 'success',
      payload: {
        me: me.dataValues,
        count: R.length(result),
        rows: paginate(limit)(offset)(result)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const contactUs = async (req, res, next) => {
  try {
    requestValidator(req);
    const { title, description } = req.body;

    // send Email

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};
