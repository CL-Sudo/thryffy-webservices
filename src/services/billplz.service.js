/* eslint-disable class-methods-use-this */
import axios from 'axios';
import R from 'ramda';
import crypto from 'crypto';

import CONFIG from '@configs/billplze.config';

import { base64 } from '@utils';

const { NODE_ENV } = process.env;
const testCollectionId = '8gtte95c';
const getCollectionId = collectionId => (NODE_ENV === 'DEV' ? testCollectionId : collectionId);

class Billplz {
  constructor() {
    // this.apiKey = NODE_ENV === 'DEV' ? CONFIG.SANDBOX_API_KEY : CONFIG.API_KEY;
    this.apiKey = CONFIG.SANDBOX_API_KEY;
    // this.url = NODE_ENV === 'DEV' ? CONFIG.SANDBOX_URL : CONFIG.URL;
    this.url = CONFIG.SANDBOX_URL;
    // this.signatureKey = NODE_ENV === 'DEV' ? CONFIG.SANDBOX_SIGNATURE_KEY : CONFIG.SIGNATURE_KEY;
    this.signatureKey = CONFIG.SANDBOX_SIGNATURE_KEY;
    // this.collectionId = CONFIG.COLLECTION_ID;
    this.collectionId = testCollectionId;
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
    collectionId,
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
          collection_id: NODE_ENV === 'DEV' ? testCollectionId : this.collectionId,
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

  async createCreaditCard({ name, email, phone, callbackUrl }) {
    try {
      const res = await axios({
        url: 'https://www.billplz.com/api/v4/cards',
        method: 'POST',
        headers: this._header,
        data: {
          name,
          email,
          phone,
          callback_url: callbackUrl
        }
      });

      return Promise.resolve(res);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async deleteCreditCard(token, cardId) {
    try {
      const res = await axios({
        method: 'DELETE',
        url: `https://www.billplz.com/api/v4/cards/${cardId}`,
        headers: this._header,
        data: { token }
      });

      return Promise.resolve(res);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async chargeCreditCard(token, billId, cardId) {
    try {
      const res = await axios({
        method: 'POST',
        url: `https://www.billplz.com/api/v4/bills/${billId}/charge`,
        headers: this._header,
        data: { token, card_id: cardId }
      });

      return Promise.resolve(res);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export { Billplz };
export default Billplz;
