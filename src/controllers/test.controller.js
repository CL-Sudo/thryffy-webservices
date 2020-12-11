import { Users } from '@models';

export const test = async (req, res, next) => {
  try {
    const seller = await Users.scope('sellerDetail').findOne({ where: { id: 1 } });

    return res.status(404).json({
      message: 'not found',
      payload: seller
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
