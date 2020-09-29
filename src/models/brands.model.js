import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Brands = SequelizeConnector.define(
  'Brands',
  {
    id: primaryKey,
    title: Sequelize.STRING(200),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    indexes: [{ fields: ['userId', 'productId'], unique: true }],
    tableName: 'brands',
    underscored: false,
    scopes: {
      search: params => search(Brands, params, [])
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
