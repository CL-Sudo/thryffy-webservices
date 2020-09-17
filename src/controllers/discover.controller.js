import { Categories, Products, SearchHistories } from '@models';
import { requestValidator } from '@validators';
import { Op } from 'sequelize';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { parseKeywordForNLP } from '@utils/query.util';
import R from 'ramda';
import { paginate, mergeCategoryWithSuggestions } from '@utils';
import { saveKeyword, getMostRelevantCategories, getChildIds } from '@services';

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
      parentId,
      categoryId,
      keyword,
      brand,
      size,
      condition,
      minPrice,
      maxPrice,
      order = 'RELEVANCE',
      limit = 10,
      offset = 0
    } = req.query;

    if (keyword) await saveKeyword(keyword);

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

    const assignCategoryId = R.ifElse(
      R.always(R.isNil(categoryId) || categoryId === 'ALL'),
      R.identity,
      R.append({ category_id: categoryId })
    );

    const assignBrand = R.ifElse(
      R.always(R.isNil(brand)),
      R.identity,
      R.append({ brand: { [Op.like]: `%${brand}%` } })
    );

    const assignCond = R.ifElse(R.always(R.isNil(condition)), R.identity, R.append({ condition }));

    const assignSize = R.ifElse(R.always(R.isNil(size)), R.identity, R.append({ size }));

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
      assignBrand,
      assignCond,
      assignSize,
      assignTitle,
      assignPrice,
      assignCategoryId
    )(initWhere);

    const childIds = await getChildIds(parentId);

    const include = [
      {
        model: Categories,
        as: 'category',
        where: {
          id: childIds
        }
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
        await product.getFavouriteCount();
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

    const assignBrand = R.ifElse(
      R.always(R.isNil(keyword)),
      R.identity,
      R.assoc('brand', { [Op.like]: `%${keyword}%` })
    );

    const where = R.pipe(assignBrand)({});

    const products = await Products.findAll({
      attributes: ['id', 'brand'],
      where
    });

    const getBrand = R.map(R.prop('brand'));

    const brands = R.pipe(getBrand, R.uniq, R.sortBy(R.toUpper))(products);

    return res.status(200).json({
      message: 'success',
      payload: {
        count: R.length(brands),
        rows: paginate(limit)(offset)(brands)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const autocomplete = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const suggestions = await SearchHistories.findAll({
      raw: true,
      attributes: ['keyword'],
      where: {
        keyword: {
          [Op.like]: `${keyword}%`
        }
      },
      limit: 10,
      order: [['searchCount', 'DESC']]
    });

    const relevantCategories = await getMostRelevantCategories(keyword);
    const mergedSuggestions = mergeCategoryWithSuggestions(
      relevantCategories,
      suggestions,
      keyword
    );

    return res.status(200).json({
      message: 'success',
      payload: mergedSuggestions
    });
  } catch (e) {
    return next(e);
  }
};
