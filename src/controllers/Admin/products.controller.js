import { Products, Brands, Sizes, Categories, ProductColors, Galleries, Users } from '@models';
import { getLimitOffset, getScopes } from '@utils/express.util';
import { Op } from 'sequelize';
import * as _ from 'lodash';

import PublicationListener from '@listeners/publication.listener';

import EVENT from '@constants/listener.constant';
import { paginate } from '@utils/utils';

export const managePublication = async (req, res, next) => {
  try {
    const { isPublished } = req.body;
    const { productId } = req.params;
    const { id: userId } = req.user;

    const product = await Products.findOne({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    if (product.isPublished === isPublished) {
      throw new Error(`This product has already been ${isPublished ? 'published' : 'unpublished'}`);
    }

    await product.update({ isPublished, updatedBy: userId });

    if (!isPublished) {
      PublicationListener.emit(EVENT.PUBLICATION.UNPUBLISHED, productId);
    }

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const verifyProductRequest = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Products.findOne({ where: { id: productId } });
    if (!product) throw new Error('Product has not found.');

    await product.update({ isVerify: true });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const unVerifyProductRequest = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Products.findOne({ where: { id: productId } });
    if (!product) throw new Error('Product has not found.');

    await product.update({ isVerify: false });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const getProductListRequest = async (req, res, next) => {
  try {
    const { brandName } = req.query;
    const { limit, offset } = getLimitOffset(req);
    const scopes = getScopes(Products)(req);

    const products = await Products.scope(scopes).findAll({
      include: [
        {
          model: Brands,
          as: 'brand',
          required: !_.isEmpty(brandName),
          where: !_.isEmpty(brandName)
            ? {
                title: {
                  [Op.like]: `%${brandName}%`
                }
              }
            : null
        },
        { model: Sizes, as: 'size', required: false },
        { model: Categories, as: 'category', required: false },
        { model: Users, as: 'seller', required: false },
        { model: Galleries, as: 'photos', required: false },
        { model: ProductColors, as: 'colors', required: false }
      ],
      distinct: true,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      message: 'Success',
      payload: {
        count: products.length,
        rows: paginate(limit)(offset)(products)
      }
    });
  } catch (e) {
    return next(e);
  }
};
