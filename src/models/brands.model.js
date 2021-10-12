import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Brands = SequelizeConnector.define(
  'Brands',
  {
    id: primaryKey,
    countryId: foreignKey('country_id', 'countries', { onDelete: 'SET NULL' }),
    title: Sequelize.STRING(200),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'brands',
    underscored: false,
    scopes: {
      search: params => search(Brands, params, []),
      byCountry(countryId) {
        return { where: { countryId: countryId || null } };
      }
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Brands, []);

export { Brands };
export default Brands;
