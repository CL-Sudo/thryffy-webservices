import Commissions from '@models/commission.model';
import { Op } from 'sequelize';
import * as _ from 'lodash';
import { requestValidator } from '@validators/index';

export const addCommissionRate = async (req, res, next) => {
  try {
    requestValidator(req);
    const { minPrice, maxPrice, commissionRate } = req.body;

    const commission = await Commissions.findOne({
      raw: true,
      where: {
        [Op.or]: [
          {
            minPrice: {
              [Op.lte]: minPrice
            },
            maxPrice: {
              [Op.gte]: minPrice
            }
          },
          {
            minPrice: {
              [Op.lte]: maxPrice
            },
            maxPrice: {
              [Op.gte]: maxPrice
            }
          }
        ]
      }
    });

    const commissionWithInfinity = await Commissions.findOne({
      raw: true,
      where: {
        maxPrice: null,
        [Op.or]: [
          {
            minPrice: {
              [Op.lte]: minPrice
            }
          },
          {
            minPrice: {
              [Op.lte]: maxPrice
            }
          }
        ]
      }
    });

    if (commission || commissionWithInfinity) {
      throw new Error(
        `Your price range is overlapped with ${_.get(commission, 'minPrice', null) ||
          commissionWithInfinity.minPrice} and ${_.get(commission, 'maxPrice', null) ||
          'Infinity'}, please try again`
      );
    }

    if (commissionRate > 1) {
      throw new Error('Commission rate cannot be greater than 1');
    }

    await Commissions.create(req.body);

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const updateCommissionRate = async (req, res, next) => {
  try {
    requestValidator(req);

    const { minPrice, maxPrice, commissionRate } = req.body;
    const { id } = req.params;

    const commission = await Commissions.findOne({
      raw: true,
      where: {
        id: {
          [Op.ne]: id
        },
        [Op.or]: [
          {
            minPrice: {
              [Op.lte]: minPrice
            },
            maxPrice: {
              [Op.gte]: minPrice
            }
          },
          {
            minPrice: {
              [Op.lte]: maxPrice
            },
            maxPrice: {
              [Op.gte]: maxPrice
            }
          }
        ]
      }
    });

    const commissionWithInfinity = await Commissions.findOne({
      raw: true,
      where: {
        id: {
          [Op.ne]: id
        },
        maxPrice: null,
        [Op.or]: [
          {
            minPrice: {
              [Op.lte]: minPrice
            }
          },
          {
            minPrice: {
              [Op.lte]: maxPrice
            }
          }
        ]
      }
    });

    if (commission || commissionWithInfinity) {
      throw new Error(
        `Your price range is overlapped with ${_.get(commission, 'minPrice', null) ||
          commissionWithInfinity.minPrice} and ${_.get(commission, 'maxPrice', null) ||
          'Infinity'}, please try again`
      );
    }

    if (commissionRate > 1) {
      throw new Error('Commission rate cannot be greater than 1');
    }

    await Commissions.update(req.body, { where: { id } });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Commissions.destroy({ where: { id }, force: true });
    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};
