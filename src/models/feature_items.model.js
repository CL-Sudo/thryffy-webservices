import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { SequelizeConnector } from '@configs/sequelize-connector.config';

const FeatureItems = SequelizeConnector.define(
  'FeatureItems',
  {
    id: primaryKey,
    productId: foreignKey('product_id', 'products', { onDelete: 'CASCADE' }),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'feature_items',
    scopes: {
      search: params => search(FeatureItems, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(FeatureItems, []);

export { FeatureItems };
export default FeatureItems;
