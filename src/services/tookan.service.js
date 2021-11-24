import axios from 'axios';

/**
 *
 * @param {*} param
 * @returns
 *
 */
export const createDeliveryTask = ({
  orderId,
  description,
  buyerName,
  buyerPhoneNo,
  buyerAddress,
  deliveryDateTime,
  sellerPhoneNo,
  sellerName,
  sellerAddress,
  pickupDateTime
}) =>
  axios({
    url: 'https://api.tookanapp.com/v2/create_task',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      api_key: process.env.TOOKAN_API_KEY,
      order_id: orderId,
      job_description: description,
      customer_username: buyerName,
      customer_phone: buyerPhoneNo,
      customer_address: buyerAddress,
      job_delivery_datetime: deliveryDateTime,
      job_pickup_phone: sellerPhoneNo,
      job_pickup_name: sellerName,
      job_pickup_address: sellerAddress,
      job_pickup_datetime: pickupDateTime,
      has_pickup: 1,
      has_delivery: 1,
      layout_type: 0,
      tracking_link: 1,
      timezone: '-480',
      auto_assignment: 1,
      notify: 1,
      geofence: 1,
      team_id: 1166551
    }
  });
