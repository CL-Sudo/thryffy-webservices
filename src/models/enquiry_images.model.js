import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const EnquiryImages = SequelizeConnector.define(
  'EnquiryImages',
  {
    id: primaryKey,
    enquiryId: foreignKey('enquiry_id', 'enquiries', false),
    path: {
      type: Sequelize.STRING
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'enquiry_images',
    underscored: false,
    scopes: {
      search: params => search(EnquiryImages, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(EnquiryImages, []);

export { EnquiryImages };
export default EnquiryImages;
