import { SequelizeConnector } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const NotificationTopicUsers = SequelizeConnector.define(
  'NotificationTopics',
  {
    topicId: foreignKey('topic_id', 'notification_topics', false),
    userId: foreignKey('user_id', 'users', false),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    indexes: [{ fields: ['topicId', 'userId'], unique: true }],
    tableName: 'notification_topic_users',
    scopes: {
      search: params => search(NotificationTopicUsers, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(NotificationTopicUsers, []);

export { NotificationTopicUsers };
export default NotificationTopicUsers;
