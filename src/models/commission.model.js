import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Commissions = SequelizeConnector.define(
  'Commissions',
  {
    id: primaryKey,
    countryId: foreignKey('country_id', 'countries', { onDelete: 'SET NULL' }),
    minPrice: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'min_price'
    },
    maxPrice: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'max_price'
    },
    commissionRate: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'commission_rate'
    },
    commissionPrice: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'commission_price'
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'commissions',
    underscored: false,
    scopes: {
      search: params => search(Commissions, params, []),
      byCountry(countryId) {
        return {
          where: { countryId }
        };
      }
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Commissions, []);

export { Commissions };
export default Commissions;
