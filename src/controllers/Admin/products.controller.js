import { Products, Brands, Categories, Galleries, Users } from '@models';
import { getLimitOffset, getScopes } from '@utils/express.util';
import { Op } from 'sequelize';
import * as _ from 'lodash';

import PublicationListener from '@listeners/publication.listener';

import EVENT from '@constants/listener.constant';

const checkIsAbleToPublishProduct = async userId => {
  try {
    const productCount = await Products.scope('countedInListing').count({ where: { userId } });

    const user = await Users.findOne({ where: { id: userId } });

    return Promise.resolve(productCount < user.maxListing);
  } catch (e) {
    return Promise.reject(e);
  }
};

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

    if (isPublished) {
      const isAbleToPublishProduct = await checkIsAbleToPublishProduct(product.userId);
      if (!isAbleToPublishProduct) {
        throw new Error('This user has reached maximum listing quota.');
      }
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

    if (brandName) {
      const brands = await Brands.findAll({
        attributes: ['id', 'title'],
        raw: true,
        where: {
          title: {
            [Op.like]: `%${brandName}%`
          }
        },
        distinct: true
      });

      const data = await Products.scope(scopes).findAndCountAll({
        where: { brandId: _.map(brands, 'id') },
        distinct: true,
        include: [
          {
            model: Brands,
            as: 'brand'
          },
          { model: Categories, as: 'category', required: false, attributes: ['title'] },
          { model: Users, as: 'seller', required: false, attributes: ['email'] },
          { model: Galleries, as: 'photos', required: false, attributes: ['filePath'] }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      // const productCount = await Products.count();

      return res.status(200).json({
        message: 'Success',
        payload: {
          count: data.count,
          rows: data.rows
        }
      });
    }

    const data = await Products.scope(scopes).findAndCountAll({
      include: [
        {
          model: Brands,
          as: 'brand'
        },
        { model: Categories, as: 'category', required: false, attributes: ['title'] },
        { model: Users, as: 'seller', required: false, attributes: ['email'] },
        { model: Galleries, as: 'photos', required: false, attributes: ['filePath'] }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      message: 'Success',
      payload: {
        count: data.count,
        rows: data.rows
      }
    });
  } catch (e) {
    return next(e);
  }
};
