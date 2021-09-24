import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { deleteObjectFromS3 } from '@tools/s3';
import { parsePathForDeleting } from '@utils/s3.util';

const Banners = SequelizeConnector.define(
  'Banners',
  {
    id: primaryKey,
    countryId: foreignKey('country_id', 'countries', { onDelete: 'SET NULL' }),
    path: {
      type: Sequelize.STRING
    },
    index: {
      type: Sequelize.INTEGER
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'banners',
    underscored: false,
    scopes: {
      search: params => search(Banners, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      },
      beforeDestroy: async banner => {
        try {
          await deleteObjectFromS3(parsePathForDeleting(banner.path));
        } catch (e) {
          throw e;
        }
      }
    }
  }
);

addScopesByAllFields(Banners, []);

export { Banners };
export default Banners;
