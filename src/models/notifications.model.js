import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { Products, Disputes, Reviews, SalesOrders } from '@models';
import OrderItems from './order_items.model';

const Notifications = SequelizeConnector.define(
  'Notifications',
  {
    id: primaryKey,
    notifierId: foreignKey('notifier_id', 'users', false),
    actorId: foreignKey('actor_id', 'users', false),
    notifiableId: {
      type: Sequelize.INTEGER.UNSIGNED,
      field: 'notifiable_id'
    },
    notifiableType: {
      type: Sequelize.STRING(30),
      field: 'notifiable_type'
    },
    title: {
      type: Sequelize.STRING(200)
    },
    description: {
      type: Sequelize.STRING
    },
    image: {
      type: Sequelize.STRING
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      field: 'is_read',
      defaultValue: false
    },
    type: {
      type: Sequelize.STRING(20)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'notifications',
    underscored: false,
    defaultScope: {
      include: [
        { model: Products, as: 'product', include: [{ all: true }] },
        { model: Disputes, as: 'dispute', include: [{ all: true }] },
        {
          model: SalesOrders,
          as: 'order',
          include: [
            { model: OrderItems, as: 'orderItems', include: [{ model: Products, as: 'product' }] }
          ]
        },
        { model: Reviews, as: 'review', include: [{ all: true }] }
      ]
    },
    scopes: {
      search: params => search(Notifications, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Notifications, []);

export { Notifications };
export default Notifications;
