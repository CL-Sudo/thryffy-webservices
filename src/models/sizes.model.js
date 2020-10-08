import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Sizes = SequelizeConnector.define(
  'Sizes',
  {
    id: primaryKey,
    type: {
      type: Sequelize.STRING(50)
    },
    international: {
      type: Sequelize.STRING(30)
    },
    us: {
      type: Sequelize.STRING(30)
    },
    uk: {
      type: Sequelize.STRING(30)
    },
    eu: {
      type: Sequelize.STRING(30)
    },
    waistSize: {
      type: Sequelize.STRING(30),
      field: 'waist_size'
    },
    age: {
      type: Sequelize.STRING(50)
    },
    height: {
      type: Sequelize.STRING(50)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'sizes',
    underscored: false,
    scopes: {
      search: params => search(Sizes, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Sizes, []);

export { Sizes };
export default Sizes;
