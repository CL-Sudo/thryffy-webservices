import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const ResponseImages = SequelizeConnector.define(
  'ResponseImages',
  {
    id: primaryKey,
    responseId: foreignKey('response_id', 'dispute_responses', false),
    path: {
      type: Sequelize.STRING
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'response_images',
    underscored: false,
    scopes: {
      search: params => search(ResponseImages, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(ResponseImages, []);

export { ResponseImages };
export default ResponseImages;
