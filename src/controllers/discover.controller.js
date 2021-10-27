import { Conditions, Categories, Products, Brands, Sizes, Users, Subscriptions } from '@models';
import { requestValidator } from '@validators';
import { Op } from 'sequelize';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import R from 'ramda';
import { getChildIds } from '@services';
import { normaliseBrand } from '@utils/product.utils';
import { defaultExcludeFields } from '@constants/sequelize.constant';
import { paginate } from '@utils/utils';
import _ from 'lodash';
import { getCountryId } from '@utils/index';

export const home = async (req, res, next) => {
  try {
    requestValidator(req);
    const { type } = req.query;

    const countryId = await getCountryId(req);

    const categories = await Categories.scope([
      { method: ['home', type] },
      { method: ['byCountry', countryId] }
    ]).findOne();

    await Promise.all(
      R.map(async category => {
        await category.getListingCount();
      }, _.get(categories, 'subCategories', []))
    );

    return res.status(200).json({
      message: 'success',
      payload: categories
    });
  } catch (e) {
    return next(e);
  }
};

export const discoverList = async (req, res, next) => {
  try {
    requestValidator(req);

    const {
      categoryId,
      keyword,
      brandId,
      sizeId,
      conditionId,
      minPrice,
      maxPrice,
      order = 'RELEVANCE',
      limit = 10,
      offset = 0
    } = req.query;

    const id = R.pathOr('N/A', ['user', 'id'])(req);

    const countryId = await getCountryId(req);

    const where = {
      ...(keyword
        ? {
            [Op.or]: [
              {
                title: {
                  [Op.like]: `%${keyword}%`
                }
              },
              {
                brandId: [
                  Sequelize.literal(`
              SELECT id FROM brands WHERE title LIKE "%${keyword}%" AND country_id=${countryId}
            `)
                ]
              }
            ]
          }
        : {})
    };

    const childIds = categoryId ? await getChildIds(categoryId) : null;

    const include = [
      {
        model: Categories,
        as: 'category',
        where: categoryId
          ? {
              id: [categoryId, ...childIds]
            }
          : null
      },
      {
        model: Brands,
        as: 'brand',
        attributes: ['id', 'title'],
        where: brandId ? { id: brandId } : null
      },
      {
        model: Sizes,
        as: 'size',
        attributes: { exclude: defaultExcludeFields },
        where: sizeId ? { id: sizeId } : null
      },
      {
        model: Users,
        as: 'seller',
        include: [{ model: Subscriptions, as: 'subscription' }]
      },
      {
        model: Conditions,
        as: 'condition',
        attributes: { exclude: defaultExcludeFields },
        where: conditionId ? { id: conditionId } : null
      }
    ];

    const filter = {
      where,
      include
    };

    const products = await Products.scope([
      'availableForSale',
      req.user ? { method: ['excludeMyProducts', req.user.id] } : {},
      { method: ['byCountry', countryId] }
    ]).findAll(filter);

    const filterByPrice = R.ifElse(
      R.always(R.or(R.isNil(maxPrice), R.isNil(minPrice))),
      data => data,
      R.filter(product => product.displayPrice >= minPrice && product.displayPrice <= maxPrice)
    );

    const filteredProducts = R.pipe(filterByPrice)(products);

    const sorter = R.cond([
      [R.always(order === 'RELEVANCE'), _.shuffle],
      [R.always(order === 'ASC'), R.sortBy(R.prop('displayPrice'))],
      [
        R.always(order === 'DESC'),
        instance => R.reverse(R.sortBy(R.prop('displayPrice'))(instance))
      ]
    ]);

    await Promise.all(
      R.map(async product => {
        await product.getExtraFields(id);
      })(filteredProducts)
    );

    const sorted = sorter(filteredProducts);

    return res.status(200).json({
      message: 'success',
      payload: {
        count: filteredProducts.length,
        rows: paginate(limit)(offset)(sorted)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const searchBrand = async (req, res, next) => {
  try {
    requestValidator(req);

    const { keyword, limit, offset } = req.query;

    const countryId = await getCountryId(req);

    if (!keyword) {
      const brands = await Brands.scope([{ method: ['byCountry', countryId] }]).findAndCountAll({
        limit,
        offset
      });
      return res.status(200).json({
        message: 'success',
        payload: brands
      });
    }

    const brands = await Brands.scope([{ method: ['byCountry', countryId] }]).findAndCountAll({
      attributes: ['id', 'title'],
      where: {
        title: {
          [Op.like]: `%${normaliseBrand(keyword)}%`
        }
      },
      order: [['title', 'ASC']],
      limit,
      offset
    });

    return res.status(200).json({
      message: 'success',
      payload: brands
    });
  } catch (e) {
    return next(e);
  }
};
