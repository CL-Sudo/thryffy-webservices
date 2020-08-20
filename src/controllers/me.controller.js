import R from 'ramda';
import { reqeustValidator } from '@validators';
import { Addresses } from '@models';

export const addAddress = async (req, res, next) => {
  try {
    reqeustValidator(req);
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
    const addresses = await Addresses.findAndCountAll({
      raw: true,
      where: { userId: id }
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
