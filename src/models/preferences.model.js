import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import Categories from './categories.model';
import Brands from './brands.model';
import Conditions from './conditions.model';
import Sizes from './sizes.model';

const Preferences = SequelizeConnector.define(
  'Preferences',
  {
    userId: {
      ...foreignKey('user_id', 'users', { onDelete: 'CASCADE' }),
      primaryKey: true
    },
    preferableId: {
      type: Sequelize.INTEGER,
      field: 'preferable_id',
      primaryKey: true
    },
    preferableType: {
      type: Sequelize.STRING(50),
      field: 'preferable_type',
      primaryKey: true
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    indexes: [{ fields: ['userId', 'preferableId', 'preferableType'], unique: true }],
    tableName: 'preferences',
    underscored: false,
    scopes: {
      search: params => search(Preferences, params, [])
    },
    defaultScope: {
      include: [
        {
          model: Categories,
          as: 'category'
        },
        {
          model: Brands,
          as: 'brand'
        },
        {
          model: Conditions,
          as: 'condition'
        },
        {
          model: Sizes,
          as: 'size'
        }
      ]
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Preferences, []);

export { Preferences };
export default Preferences;
