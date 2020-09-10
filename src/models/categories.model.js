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

const Categories = SequelizeConnector.define(
  'Categories',
  {
    id: primaryKey,
    parentId: {
      ...foreignKey('parent_id', 'categories', { onDelete: 'CASCADE' }),
      defaultValue: null
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
              as: 'subCategories'
            }
          ]
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
