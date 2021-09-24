import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Packages = SequelizeConnector.define(
  'Packages',
  {
    id: primaryKey,
    countryId: foreignKey('country_id', 'countries', { onDelete: 'SET NULL' }),
    title: {
      type: Sequelize.STRING(50)
    },
    listing: {
      type: Sequelize.INTEGER,
      get() {
        if (this.getDataValue('listing') === 0) {
          return 999999999999999;
        }
        return this.getDataValue('listing');
      }
    },
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'packages',
    underscored: false,
    scopes: {
      search: params => search(Packages, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Packages, []);

export { Packages };
export default Packages;
