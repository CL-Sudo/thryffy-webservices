import { Products } from '@models';

export const managePublication = async (req, res, next) => {
  try {
    const { isPublished } = req.body;
    const { id } = req.params;
    const { id: userId } = req.user;

    const product = await Products.findOne({ where: { id } });
    if (!product) throw new Error('Product not found');

    await product.update({ isPublished, updatedBy: userId });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};
