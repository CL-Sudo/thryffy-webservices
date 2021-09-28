import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { deleteObjectFromS3 } from '@tools/s3';

const Countries = SequelizeConnector.define(
  'Countries',
  {
    id: primaryKey,
    name: {
      type: Sequelize.STRING(100)
    },
    code: {
      type: Sequelize.STRING(3)
    },
    flag: {
      type: Sequelize.TEXT
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'countries',
    underscored: false,
    scopes: {
      search: params => search(Countries, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      },
      afterDestroy: (instance, { transaction }) => {
        if (instance.flag) {
          deleteObjectFromS3(instance.flag);
        }
      },
      afterUpdate: (instance, { transaction }) => {
        if (instance.previous('flag') && instance.flag !== instance.previous('flag')) {
          deleteObjectFromS3(instance.previous('flag'));
        }
      }
    }
  }
);

addScopesByAllFields(Countries, []);

export { Countries };
export default Countries;
