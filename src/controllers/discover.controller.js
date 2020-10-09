import { Categories, Products, Brands, Sizes } from '@models';
import { requestValidator } from '@validators';
import { Op } from 'sequelize';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { parseKeywordForNLP } from '@utils/query.util';
import R from 'ramda';
import { getChildIds } from '@services';
import { normaliseBrand } from '@utils/product.utils';
import { defaultExcludeFields } from '@constants/sequelize.constant';

export const home = async (req, res, next) => {
  try {
    requestValidator(req);
    const { type } = req.query;

    const categories = await Categories.scope({ method: ['home', type] }).findOne();

    await Promise.all(
      R.map(async category => {
        await category.getListingCount();
      }, categories.subCategories)
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
      condition,
      minPrice,
      maxPrice,
      order = 'RELEVANCE',
      limit = 10,
      offset = 0
    } = req.query;

    const { id } = req.user;

    const initWhere = [{}];

    const assignPrice = R.ifElse(
      R.always(!R.isNil(maxPrice) && !R.isNil(minPrice)),
      R.append({
        price: {
          [Op.and]: [
            {
              [Op.gte]: minPrice
            },
            {
              [Op.lte]: maxPrice
            }
          ]
        }
      }),
      R.identity
    );

    // const assignCategoryId = R.ifElse(
    //   R.always(R.isNil(categoryId) || categoryId === 'ALL'),
    //   R.identity,
    //   R.append({ category_id: categoryId })
    // );

    // const assignBrand = R.ifElse(
    //   R.always(R.isNil(brand)),
    //   R.identity,
    //   R.append({ brand: { [Op.like]: `%${brand}%` } })
    // );

    const assignCond = R.ifElse(R.always(R.isNil(condition)), R.identity, R.append({ condition }));

    // const assignSize = R.ifElse(R.always(R.isNil(size)), R.identity, R.append({ size }));

    const assignTitle = param => {
      if (R.isNil(keyword)) {
        return param;
      }
      return R.append(
        Sequelize.literal(
          `MATCH (products.title, products.description) AGAINST ('${parseKeywordForNLP(
            keyword
          )}' IN NATURAL LANGUAGE MODE)`
        )
      )(param);
    };

    const assignOrder = R.ifElse(
      R.always(R.equals('RELEVANCE', order)),
      R.identity,
      R.assoc('order', [['price', order]])
    );

    const where = R.pipe(
      // assignBrand,
      assignCond,
      // assignSize,
      assignTitle,
      assignPrice
      // assignCategoryId
    )(initWhere);

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
      }
    ];

    const filter = R.pipe(assignOrder)({
      where,
      include,
      limit,
      offset
    });

    const products = await Products.findAndCountAll(filter);

    await Promise.all(
      R.map(async product => {
        await product.getExtraFields(id);
      })(products.rows)
    );

    return res.status(200).json({
      message: 'success',
      payload: products
    });
  } catch (e) {
    return next(e);
  }
};

export const searchBrand = async (req, res, next) => {
  try {
    requestValidator(req);

    const { keyword, limit, offset } = req.query;

    if (!keyword) {
      return res.status(200).json({
        message: 'success',
        payload: {
          count: 0,
          rows: []
        }
      });
    }

    const brands = await Brands.findAndCountAll({
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

export const autocomplete = async (req, res, next) => {
  try {
    const { keyword, limit = 10, offset = 0 } = req.query;
    const { id } = req.user;

    const products = await Products.findAndCountAll({
      include: [
        {
          model: Brands,
          as: 'brand',
          attributes: ['id', 'title']
        },
        { model: Sizes, as: 'size', attributes: { exclude: defaultExcludeFields } }
      ],
      where: {
        title: {
          [Op.like]: `%${keyword}%`
        }
      },
      limit,
      offset
    });

    await Promise.all(
      R.map(async product => {
        await product.getExtraFields(id);
      })(products.rows)
    );

    return res.status(200).json({
      message: 'success',
      payload: products
    });
  } catch (e) {
    return next(e);
  }
};
