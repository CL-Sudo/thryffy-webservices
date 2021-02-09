import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const DisputesImages = SequelizeConnector.define(
  'DisputesImages',
  {
    id: primaryKey,
    disputeId: foreignKey('dispute_id', 'disputes', false),
    path: {
      type: Sequelize.STRING
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'dispute_images',
    underscored: false,
    scopes: {
      search: params => search(DisputesImages, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(DisputesImages, []);

export { DisputesImages };
export default DisputesImages;
