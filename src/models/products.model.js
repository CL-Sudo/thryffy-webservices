import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import {
  AT_RECORDER,
  BY_RECORDER,
  primaryKey,
  foreignKey,
  defaultExcludeFields
} from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { Users } from '@models/users.model';
import { Categories } from '@models/categories.model';
import { Galleries } from '@models/galleries.model';
import { ProductColors } from '@models/product_colors.model';
import { FavouriteProducts } from '@models/favourite_products.model';
import { CartItems } from '@models/cart_items.model';
import { Brands } from '@models/brands.model';
import { Sizes } from '@models/sizes.model';
import { Conditions } from '@models/conditions.model';
import { Op } from 'sequelize';
import R from 'ramda';

const Products = SequelizeConnector.define(
  'Products',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', false),
    categoryId: foreignKey('category_id', 'categories', false),
    brandId: foreignKey('brand_id', 'brands', false),
    sizeId: foreignKey('size_id', 'sizes', false),
    conditionId: foreignKey('condition_id', 'conditions', false),
    title: {
      type: Sequelize.STRING(100)
    },
    description: {
      type: Sequelize.TEXT
    },
    thumbnail: {
      type: Sequelize.STRING
    },
    originalPrice: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'original_price'
    },
    markupPrice: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'markup_price'
    },
    displayPrice: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('originalPrice') + this.getDataValue('markupPrice');
      }
    },
    isPublished: {
      type: Sequelize.BOOLEAN,
      field: 'is_published',
      defaultValue: true
    },
    isPurchased: {
      type: Sequelize.BOOLEAN,
      field: 'is_purchased',
      defaultValue: false
    },
    viewCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'view_count'
    },
    soldAt: {
      type: Sequelize.DATE,
      field: 'sold_at'
    },
    favouriteCount: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('favouriteCount');
      }
    },
    isAddedToFavourite: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('isAddedToFavourite');
      }
    },
    isAddedToCart: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('isAddedToCart');
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
      default: {
        attributes: { exclude: defaultExcludeFields },
        include: [
          { model: Sizes, as: 'size', attributes: { exclude: defaultExcludeFields } },
          { model: Brands, as: 'brand', attributes: { exclude: defaultExcludeFields } },
          {
            model: Categories,
            as: 'category',
            attributes: { exclude: defaultExcludeFields }
            // through: { attributes: [] }
            // include: [{ model: Categories, as: 'parentCategory' }]
          },
          { model: ProductColors, as: 'colors', attributes: { exclude: defaultExcludeFields } },
          { model: Galleries, as: 'photos', attributes: { exclude: defaultExcludeFields } },
          { model: Conditions, as: 'condition', attributes: { exclude: defaultExcludeFields } },
          {
            model: Users,
            as: 'seller',
            attributes: ['id', 'fullName', 'username', 'profilePicture']
          }
        ]
      },
      productPage(productId) {
        return {
          where: { id: productId },
          include: [
            { model: Sizes, as: 'size', attributes: { exclude: defaultExcludeFields } },
            { model: Brands, as: 'brand', attributes: { exclude: defaultExcludeFields } },
            {
              model: Categories,
              as: 'category',
              attributes: { exclude: defaultExcludeFields }
              // through: { attributes: [] }
              // include: [{ model: Categories, as: 'parentCategory' }]
            },
            { model: ProductColors, as: 'colors', attributes: { exclude: defaultExcludeFields } },
            { model: Galleries, as: 'photos', attributes: { exclude: defaultExcludeFields } },
            { model: Conditions, as: 'condition', attributes: { exclude: defaultExcludeFields } },
            {
              model: Users,
              as: 'seller',
              attributes: ['id', 'fullName', 'username', 'profilePicture']
            }
          ]
        };
      },
      listings: {
        attributes: { exclude: ['deletedBy', 'deletedAt', 'updatedBy', 'updatedAt'] },
        include: [
          {
            model: Categories,
            as: 'category',
            attributes: { exclude: defaultExcludeFields }
          },
          {
            model: Brands,
            as: 'brand',
            attributes: ['id', 'title']
          },
          { model: Sizes, as: 'size', attributes: { exclude: defaultExcludeFields } },
          { model: Conditions, as: 'condition', attributes: { exclude: defaultExcludeFields } }
        ],
        // where: {
        //   id: {
        //     [Op.notIn]: [
        //       Sequelize.literal(
        //         `SELECT product_id FROM order_items
        //           WHERE sales_order_id IN (
        //             SELECT id FROM sales_orders
        //               WHERE
        //                 payment_status = 'SUCCESS'
        //                   AND
        //                 delivery_status <> 'CANCELLED'
        //           )`
        //       )
        //     ]
        //   }
        // },
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

Products.prototype.getFavouriteCount = async function() {
  try {
    const favouriteCount = await FavouriteProducts.count({
      where: { productId: this.id }
    });
    this.setDataValue('favouriteCount', favouriteCount);
    return favouriteCount;
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
    return !R.isNil(favouriteProduct);
  } catch (e) {
    throw e;
  }
};

Products.prototype.checkIsAddedToCart = async function(userId) {
  const cartItem = await CartItems.findOne({
    raw: true,
    where: {
      userId,
      productId: this.id
    }
  });

  this.setDataValue('isAddedToCart', !R.isNil(cartItem));
};

Products.prototype.getExtraFields = async function(userId) {
  try {
    await this.getFavouriteCount();
    await this.checkIsAddedToFavourite(userId);
    await this.checkIsAddedToCart(userId);
  } catch (e) {
    throw e;
  }
};

export { Products };
export default Products;
