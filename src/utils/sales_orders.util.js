import _ from 'lodash';
import moment from 'moment';

export const generateOrderNumber = orderId =>
  `${moment().format('YYYY')}${_.padStart(orderId, 8, '0')}`;
