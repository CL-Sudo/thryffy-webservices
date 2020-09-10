import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const SearchHistories = SequelizeConnector.define(
  'SearchHistories',
  {
    id: primaryKey,
    keyword: {
      type: Sequelize.STRING
    },
    searchCount: {
      type: Sequelize.INTEGER,
      field: 'search_count'
    },
    ...AT_RECORDER
  },
  {
    tableName: 'search_histories',
    underscored: false,
    scopes: {
      search: params => search(SearchHistories, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(SearchHistories, []);

export { SearchHistories };
export default SearchHistories;
