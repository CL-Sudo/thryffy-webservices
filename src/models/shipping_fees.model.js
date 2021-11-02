import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const ShippingFees = SequelizeConnector.define(
  'ShippingFees',
  {
    id: primaryKey,
    countryId: foreignKey('country_id', 'countries', { onDelete: 'SET NULL' }),
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    markupPrice: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'markup_price'
    },
    actualPrice: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'actual_price'
    },
    parcelName: {
      type: Sequelize.STRING(80),
      field: 'parcel_name'
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
      search: params => search(ShippingFees, params, []),
      byCountry(countryId) {
        return { where: { countryId } };
      }
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
