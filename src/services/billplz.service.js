/* eslint-disable no-restricted-syntax */
/* eslint-disable prettier/prettier */
/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
import axios from 'axios';
import R from 'ramda';
import crypto from 'crypto';
import _ from 'lodash';

import CONFIG from '@configs/billplze.config';

import { base64 } from '@utils';
import SalesOrders from '@models/sales_orders.model';
import Users from '@models/users.model';

const { NODE_ENV } = process.env;
const testCollectionId = '8gtte95c';
const getCollectionId = collectionId => (NODE_ENV === 'DEV' ? testCollectionId : collectionId);

//

class Billplz {
  constructor() {
    this.apiKey = CONFIG.API_KEY;
    this.url = CONFIG.URL;
    this.signatureKey = CONFIG.SIGNATURE_KEY;
    this.collectionId = CONFIG.COLLECTION_ID;
    // this.apiKey = NODE_ENV === 'DEV' ? CONFIG.SANDBOX_API_KEY : CONFIG.API_KEY;
    // this.url = NODE_ENV === 'DEV' ? CONFIG.SANDBOX_URL : CONFIG.URL;
    // this.signatureKey = NODE_ENV === 'DEV' ? CONFIG.SANDBOX_SIGNATURE_KEY : CONFIG.SIGNATURE_KEY;
    // this.collectionId = NODE_ENV === 'DEV' ? testCollectionId : CONFIG.COLLECTION_ID;
    this._header = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${base64.encode('29c1eb6d-f8b5-4b33-907a-df5ac16d90d1')}`
    };
  }

  // eslint-disable-next-line class-methods-use-this
  parseObjectToString(reqBody) {
    const parsedString = Object.keys(R.dissoc('x_signature', reqBody))
      .map(key => `${key}${R.isNil(reqBody[key]) ? '' : reqBody[key]}`)
      .sort()
      .join('|');

    return parsedString;
  }

  /**
   *
   * @param {String} xSignature
   * @param {Object} body
   */
  verifyXSignature(xSignature, body) {
    const hmac = crypto.createHmac('sha256', this.signatureKey);
    hmac.update(this.parseObjectToString(body));
    const hash = hmac.digest('hex');

    return hash === xSignature;
  }

  async checkIsAuthenticated() {
    try {
      const res = await axios({
        method: 'GET',
        url: `${this.url}/v4/webhook_rank`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64.encode(this.apiKey)}`
        }
      });
      return Promise.resolve(res.status === 200);
    } catch (e) {
      return Promise.resolve(R.pathOr(500, ['response', 'status'], e) === 200);
    }
  }

  async createBill({
    // collectionId,
    email,
    mobile,
    name = '',
    amount,
    callbackUrl,
    itemName,
    redirectUrl
  }) {
    try {
      if (R.isNil(email) && R.isNil(mobile)) {
        throw new Error('mobile or email must be provided');
      }
      const res = await axios({
        method: 'POST',
        params: {
          collection_id: this.collectionId,
          // collection_id: NODE_ENV === 'DEV' ? testCollectionId : this.collectionId,
          email,
          mobile,
          name,
          amount: amount * 100,
          description: `Payment for ${itemName}`,
          callback_url: callbackUrl,
          redirect_url: redirectUrl
        },
        url: `${this.url}/v3/bills`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64.encode(this.apiKey)}`
        }
      });
      return Promise.resolve(res);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getACollection(collectionId) {
    try {
      const res = await axios({
        method: 'GET',
        url: `${this.url}/v3/collections/${getCollectionId(collectionId)}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64.encode(this.apiKey)}`
        }
      });
      return Promise.resolve(res);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getABill(billId) {
    try {
      const res = await axios({
        method: 'GET',
        url: `${this.url}/v3/bills/${billId}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64.encode(this.apiKey)}`
        }
      });
      return Promise.resolve(res);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getATransaction(billId) {
    try {
      const res = await axios({
        method: 'GET',
        url: `${this.url}/v3/bills/${billId}/transactions`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64.encode(this.apiKey)}`
        }
      });
      return Promise.resolve(res);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getBillByTransactionId(transactionId, email, amount) {
    try {
      const orders = await SalesOrders.findAll({
        where: { total: amount },
        include: [{ model: Users, as: 'buyer', where: { email } }],
        order: [['createdAt', 'DESC']]
      });

      for (const instance of orders) {
        const { data } = await this.getATransaction(instance.billId);
        const i = _.findIndex(data.transactions, t => t.id === transactionId);
        if (i !== -1) {
          return Promise.resolve(instance.billId);
        }
      }

      return Promise.resolve(null);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export { Billplz };
export default Billplz;
