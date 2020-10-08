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
import R from 'ramda';
import { Products } from '@models';
import { Sizes } from '@models/sizes.model';

const Categories = SequelizeConnector.define(
  'Categories',
  {
    id: primaryKey,
    parentId: {
      ...foreignKey('parent_id', 'categories', { onDelete: 'CASCADE' }),
      defaultValue: null
    },
    shippingFeeId: foreignKey('shipping_fee_id', 'shipping_fees', false),
    default: {
      type: Sequelize.STRING(30)
    },
    title: {
      type: Sequelize.STRING(100)
    },
    description: {
      type: Sequelize.TEXT
    },
    thumbnail: {
      type: Sequelize.STRING
    },
    listingCount: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('listingCount');
      }
    },
    childrenCount: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('childrenCount');
      }
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'categories',
    underscored: false,
    defaultScope: {
      attributes: {
        exclude: defaultExcludeFields
      }
    },
    scopes: {
      search: params => search(Categories, params, []),
      home(title) {
        return {
          where: { title },
          include: [
            {
              model: Categories,
              as: 'subCategories',
              include: [
                {
                  model: Categories,
                  as: 'subCategories'
                }
              ]
            }
          ]
        };
      },
      sizes: {
        attributes: { exclude: defaultExcludeFields },
        include: [
          {
            model: Sizes,
            as: 'sizes',
            attributes: { exclude: defaultExcludeFields },
            through: { attributes: [] }
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

addScopesByAllFields(Categories, []);

Categories.prototype.getChildrenCount = async function() {
  try {
    const children = await Categories.findOne({
      where: { id: this.id },
      include: [
        {
          model: Categories,
          as: 'subCategories'
        }
      ]
    });

    const childrenCount = children.subCategories.length;

    this.setDataValue('childrenCount', childrenCount);
  } catch (e) {
    throw e;
  }
};

Categories.prototype.getListingCount = async function() {
  try {
    const childCategories = await Categories.findAll({ where: { parentId: this.id } });
    const childIds = R.map(R.prop('id'))(childCategories);

    const productsCount = await Products.count({ where: { categoryId: childIds } });

    this.setDataValue('listingCount', productsCount);
  } catch (e) {
    throw e;
  }
};

Categories.prototype.getRoot = async function(categoryId = this.id) {
  try {
    const category = await Categories.findOne({
      attributes: ['id', 'shipping_fee_id', 'parentId', 'title', 'description', 'thumbnail'],
      raw: true,
      where: { id: categoryId }
    });

    if (!category.parentId) return category;

    return await this.getRoot(category.parentId);
  } catch (e) {
    throw e;
  }
};

Categories.prototype.getExtraFields = async function() {
  try {
    await this.getListingCount();
    await this.getChildrenCount();
  } catch (e) {
    throw e;
  }
};

export { Categories };
export default Categories;
