import { deleteProductImages } from '@services/product.service';
import { Galleries } from '@models';

module.exports = {
  up: async () => Promise.resolve(),

  down: async () => {
    try {
      const images = await Galleries.findAll({ raw: true, attributes: ['id'] });
      const ids = images.map(image => image.id);
      await deleteProductImages(ids);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
