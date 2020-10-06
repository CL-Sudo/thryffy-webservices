import { EventEmitter } from 'events';
import { CartItems } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';

export const cartListener = new EventEmitter();

const removeCartItems = async productIds => {
  const transaction = await sequelize.transaction();
  try {
    await CartItems.destroy({ where: { productId: productIds }, transaction });
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    console.error('e', e);
  }
};

cartListener.on('Payment Made', removeCartItems);
