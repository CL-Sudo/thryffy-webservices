import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey, defaultExcludeFields } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { OrderItems, Products, Users } from '@models';

const Reviews = SequelizeConnector.define(
  'Reviews',
  {
    id: primaryKey,
    sellerId: {
      type: Sequelize.INTEGER.UNSIGNED,
      field: 'seller_id',
      allowNull: false
    },
    orderItemId: foreignKey('order_item_id', 'order_items', false),
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'reviews',
    underscored: false,
    scopes: {
      search: params => search(Reviews, params, []),
      reviews: {
        include: [
          {
            model: OrderItems,
            as: 'orderItem',
            attributes: { exclude: defaultExcludeFields },
            include: [
              {
                model: Products,
                as: 'product',
                attributes: ['id', 'title']
              }
            ]
          },
          {
            model: Users,
            as: 'buyer',
            attributes: ['id', 'fullName', 'firstName', 'lastName', 'profilePicture']
          }
        ]
      }
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Reviews, []);

export { Reviews };
export default Reviews;
