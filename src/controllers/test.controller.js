import R from 'ramda';

import * as Models from '@models';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    const not = await Models.Notifications.findOne({ where: { id: 116 } });

    console.log(`not`, not);

    return res.status(200).json({
      message: 'not found',
      payload: not
    });
  } catch (e) {
    return next(e);
  }
};
