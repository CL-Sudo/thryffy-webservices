import { SequelizeConnector } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const CartItems = SequelizeConnector.define(
  'CartItems',
  {
    userId: foreignKey('user_id', 'users', false),
    productId: foreignKey('product_id', 'products', false),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    indexes: [{ fields: ['userId', 'productId'], unique: true }],
    tableName: 'cart_items',
    underscored: false,
    scopes: {
      search: params => search(CartItems, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(CartItems, []);

export { CartItems };
export default CartItems;
