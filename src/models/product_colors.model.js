import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const ProductColors = SequelizeConnector.define(
  'ProductColors',
  {
    id: primaryKey,
    productId: foreignKey('product_id', 'products', false),
    color: {
      type: Sequelize.STRING(50)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'product_colors',
    underscored: false,
    scopes: {
      search: params => search(ProductColors, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(ProductColors, []);

export { ProductColors };
export default ProductColors;
