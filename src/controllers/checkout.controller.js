import R from 'ramda';

export const checkout = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { productIds } = req.body;

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};
