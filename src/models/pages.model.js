import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Pages = SequelizeConnector.define(
  'Pages',
  {
    id: primaryKey,
    title: {
      type: Sequelize.STRING(200)
    },
    content: {
      type: Sequelize.TEXT
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'pages',
    underscored: false,
    scopes: {
      search: params => search(Pages, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Pages, []);

export { Pages };
export default Pages;
