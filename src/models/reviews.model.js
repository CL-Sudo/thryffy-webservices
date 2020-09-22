import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import {
  AT_RECORDER,
  BY_RECORDER,
  foreignKey,
  primaryKey,
  defaultExcludeFields
} from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { OrderItems, Products, Users, SalesOrders } from '@models';

const Reviews = SequelizeConnector.define(
  'Reviews',
  {
    id: primaryKey,
    sellerId: {
      type: Sequelize.INTEGER.UNSIGNED,
      field: 'seller_id',
      allowNull: false
    },
    orderId: foreignKey('order_id', 'sales_orders', false),
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
        attributes: { exclude: ['updatedAt', 'deletedAt', 'updatedBy', 'deletedBy'] },
        include: [
          {
            model: SalesOrders,
            as: 'order',
            attributes: { exclude: defaultExcludeFields },
            include: [
              {
                model: OrderItems,
                as: 'orderItems',
                attributes: ['id'],
                include: [
                  {
                    model: Products,
                    as: 'product',
                    attributes: ['id', 'title']
                  }
                ]
              }
            ]
          },
          {
            model: Users,
            as: 'buyer',
            attributes: ['id', 'fullName', 'username', 'profilePicture']
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
