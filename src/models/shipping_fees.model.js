import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const ShippingFees = SequelizeConnector.define(
  'ShippingFees',
  {
    id: primaryKey,
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    markupPrice: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'markup_price'
    },
    type: {
      type: Sequelize.STRING(50)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'shipping_fees',
    underscored: false,
    scopes: {
      search: params => search(ShippingFees, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(ShippingFees, []);

export { ShippingFees };
export default ShippingFees;
