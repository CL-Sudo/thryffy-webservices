import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { Op } from 'sequelize';

const CommissionFreeCampaigns = SequelizeConnector.define(
  'CommissionFreeCampaigns',
  {
    id: primaryKey,
    countryId: foreignKey('country_id', 'countries', { onDelete: 'SET NULL' }),
    startDate: {
      type: Sequelize.DATE,
      field: 'start_date',
      allowNull: false
    },
    endDate: {
      type: Sequelize.DATE,
      field: 'end_date',
      allowNull: false
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'commission_free_campaigns',
    scopes: {
      search: params => search(CommissionFreeCampaigns, params, []),
      runningCampaign: {
        where: {
          startDate: {
            [Op.lte]: new Date()
          },
          endDate: {
            [Op.gte]: new Date()
          }
        }
      },
      byCountry(countryId) {
        return {
          where: { countryId }
        };
      }
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(CommissionFreeCampaigns, []);

export { CommissionFreeCampaigns };
export default CommissionFreeCampaigns;
