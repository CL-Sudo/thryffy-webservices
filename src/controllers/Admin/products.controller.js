import { Products } from '@models';

import PublicationListener from '@listeners/publication.listener';

import EVENT from '@constants/listener.constant';

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
