import R from 'ramda';
import axios from 'axios';

import { NotificationTopicUsers, NotificationTopics, Users } from '@models';

import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';

export const sendCloudMessage = ({ token = null, title, message, data, topic = null }) =>
  new Promise(async (resolve, reject) => {
    try {
      const init = {
        url: process.env.FCM_URL,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${process.env.FCM_SERVER_KEY}`
        },
        method: 'POST',
        data: {
          notification: {
            title,
            body: message,
            content_available: true,
            sound: 'default'
          },
          priority: 'high',
          data
        }
      };

      const cloudMessageObj = R.cond([
        [R.always(R.and(R.isNil(topic), R.isNil(token))), R.assocPath(['data', 'to'], 'no token')],
        [R.always(R.isNil(token)), R.assocPath(['data', 'to'], `/topics/${topic}`)],
        [R.always(R.isNil(topic)), R.assocPath(['data', 'to'], token)]
      ])(init);

      const res = await axios(cloudMessageObj);

      return resolve(res);
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {Array} tokens
 * @param {String} topic
 */
export const subscribeTokenToTopic = (tokens, topic) =>
  new Promise(async (resolve, reject) => {
    try {
      const tokenArr = R.type(tokens) !== 'Array' ? [tokens] : tokens;

      const res = await axios({
        url: `https://iid.googleapis.com/iid/v1:batchAdd`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${process.env.FCM_SERVER_KEY}`
        },
        data: {
          to: `/topics/${topic}`,
          registration_tokens: tokenArr
        }
      });

      await sequelize.transaction(async transaction => {
        const notificationTopic = await NotificationTopics.findOrCreate({
          where: { title: topic },
          defaults: { title: topic },
          transaction
        });

        await Promise.all(
          tokenArr.map(async token => {
            const user = await Users.findOne({ where: { deviceToken: token }, transaction });
            const notificationTopicUser = await NotificationTopicUsers.findOne({
              where: { userId: user.id, topicId: notificationTopic[0].id }
            });
            if (!notificationTopicUser) {
              await NotificationTopicUsers.create(
                {
                  userId: user.id,
                  topicId: notificationTopic[0].id
                },
                { transaction }
              );
            }
          })
        );
      });

      return resolve(res);
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {Array} tokens
 * @param {String} topic
 */
export const unsubscribeTokensFromTopic = (tokens, topic) =>
  new Promise(async (resolve, reject) => {
    try {
      const tokenArr = R.type(tokens) !== 'Array' ? [tokens] : tokens;
      const res = await axios({
        url: 'https://iid.googleapis.com/iid/v1:batchRemove',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${process.env.FCM_SERVER_KEY}`
        },
        data: {
          to: `/topics/${topic}`,
          registration_tokens: R.type(tokens) !== 'Array' ? [tokens] : tokens
        }
      });

      await sequelize.transaction(async transaction => {
        const notificationTopic = await NotificationTopics.findOne({
          where: { title: topic },
          transaction
        });

        await Promise.all(
          tokenArr.map(async token => {
            const user = await Users.findOne({ where: { deviceToken: token }, transaction });
            await NotificationTopicUsers.destroy({
              force: true,
              where: { userId: user.id, topicId: notificationTopic.id },
              transaction
            });
          })
        );
      });
      return resolve(res);
    } catch (e) {
      return reject(e);
    }
  });
