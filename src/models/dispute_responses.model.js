import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const DisputeResponses = SequelizeConnector.define(
  'DisputeResponses',
  {
    id: primaryKey,
    disputeId: foreignKey('dispute_id', 'disputes', false),
    response: {
      type: Sequelize.STRING(250)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'dispute_responses',
    underscored: false,
    scopes: {
      search: params => search(DisputeResponses, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(DisputeResponses, []);

export { DisputeResponses };
export default DisputeResponses;
