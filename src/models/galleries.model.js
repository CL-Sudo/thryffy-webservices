import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Galleries = SequelizeConnector.define(
  'Galleries',
  {
    id: primaryKey,
    productId: foreignKey('product_id', 'products', false),
    caption: {
      type: Sequelize.STRING
    },
    filePath: {
      type: Sequelize.STRING
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'galleries',
    underscored: false,
    scopes: {
      search: params => search(Galleries, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Galleries, []);

export { Galleries };
export default Galleries;
