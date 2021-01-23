import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { SequelizeConnector } from '@configs/sequelize-connector.config';

const Followings = SequelizeConnector.define(
  'Followings',
  {
    followerId: foreignKey('follower_id', 'users'),
    sellerId: foreignKey('seller_id', 'users'),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'followings',
    indexes: [{ fields: ['sellerId', 'followerId'], unique: true }],
    scopes: {
      search: params => search(Followings, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Followings, []);

export { Followings };
export default Followings;
