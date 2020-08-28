import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { Users, Categories, Galleries, ProductColors, FavouriteProducts } from '@models';
import { Op } from 'sequelize';
import R from 'ramda';

const Products = SequelizeConnector.define(
  'Products',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', false),
    title: {
      type: Sequelize.STRING(100)
    },
    description: {
      type: Sequelize.TEXT
    },
    thumbnail: {
      type: Sequelize.STRING
    },
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    condition: {
      type: Sequelize.STRING(50)
    },
    size: {
      type: Sequelize.STRING(50)
    },
    brand: {
      type: Sequelize.STRING(100)
    },
    viewCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'view_count'
    },
    favouriteNumber: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('favouriteNumber');
      }
    },
    isAddedToFavourite: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('isAddedToFavourite');
      }
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'products',
    underscored: false,
    scopes: {
      search: params => search(Products, params, []),
      productPage: {
        include: [
          {
            model: Categories,
            as: 'categories',
            through: { attributes: [] }
            // include: [{ model: Categories, as: 'parentCategory' }]
          },
          { model: ProductColors, as: 'colors' },
          { model: Galleries, as: 'photos' },
          { model: Users, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] }
        ]
      },
      listings: {
        where: {
          id: {
            [Op.notIn]: [
              Sequelize.literal(
                `SELECT product_id FROM order_items
                  WHERE sales_order_id IN (
                    SELECT id FROM sales_orders
                      WHERE
                        payment_status = 'SUCCESS'
                          AND
                        delivery_status <> 'CANCELLED'
                  )`
              )
            ]
          }
        },
        order: [['createdAt', 'DESC']]
      }
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Products, []);

Products.prototype.getFavouriteNumber = async function() {
  try {
    const favouriteCount = await FavouriteProducts.count({
      where: { productId: this.id }
    });
    this.setDataValue('favouriteNumber', favouriteCount);
  } catch (e) {
    throw e;
  }
};

Products.prototype.checkIsAddedToFavourite = async function(userId) {
  try {
    const favouriteProduct = await FavouriteProducts.findOne({
      raw: true,
      where: {
        userId,
        productId: this.id
      }
    });
    this.setDataValue('isAddedToFavourite', R.not(R.isNil(favouriteProduct)));
  } catch (e) {
    throw e;
  }
};

export { Products };
export default Products;
