import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import Countries from '@models/countries.model';
import { uploadFiles } from '@tools/multer.tool';
import * as _ from 'lodash';

export const create = async (req, res, next) => {
  try {
    const payload = await Sequelize.transaction(async transaction => {
      const country = await Countries.create(
        {
          name: req.body.name,
          code: _.toUpper(req.body.code),
          currencySymbol: req.body.currencySymbol
        },
        { transaction }
      );

      const uploads = await uploadFiles(req.files, ['flag']);

      await country.update({ flag: _.get(uploads, 'flag[0].path', null) }, { transaction });

      return country;
    });

    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const payload = await Sequelize.transaction(async transaction => {
      const country = await Countries.findOne({ where: { id: req.params.id } });

      if (!country) {
        throw new Error('Invalid id given, no country found');
      }

      await country.update(
        {
          name: req.body.name,
          code: _.toUpper(req.body.code),
          currencySymbol: req.body.currencySymbol
        },
        { transaction }
      );

      if (!_.isEmpty(req.files)) {
        const uploads = await uploadFiles(req.files, ['flag']);

        await country.update({ flag: _.get(uploads, 'flag[0].path', null) }, { transaction });
      }

      return country;
    });

    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};
