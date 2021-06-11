import { Users } from '@models';

export const test = async (req, res, next) => {
  try {
    // const { q } = req.query;

    const user = await Users.findOne({ where: { id: 57 } });
    console.log(`user`, user);

    return res.status(200).json({
      message: 'not found'
    });
  } catch (e) {
    return next(e);
  }
};
