import { Products } from '@models';
import R from 'ramda';

export const getPriceSummary = async ({ productIds, addressId = null, courier }) =>
  new Promise(async (resolve, reject) => {
    try {
      const summary = {
        subTotal: 0,
        shippingFee: 0,
        tax: 0,
        total: 0
      };

      const addSubTotal = async summaryObj => {
        try {
          const subTotalLens = R.lens(R.prop('subTotal'), R.assoc('subTotal'));
          const totalLens = R.lens(R.prop('total'), R.assoc('total'));

          const setTotal = R.set(totalLens);
          const setSubTotal = R.set(subTotalLens);

          const total = R.view(totalLens, summaryObj);

          const products = await Products.findAll({
            raw: true,
            attributes: ['price', 'id'],
            where: {
              id: productIds
            }
          });

          const getPriceArr = R.map(R.prop('price'));
          const newSubTotal = R.pipe(getPriceArr, R.sum)(products);
          const newTotal = R.add(total, newSubTotal);

          const newSummary = R.pipe(setSubTotal(newSubTotal), setTotal(newTotal))(summaryObj);

          return Promise.resolve(newSummary);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const addShippingFee = async summaryObj => {
        try {
          if (R.isNil(addressId)) return Promise.resolve(summaryObj);

          const shippingLens = R.lens(R.prop('shippingFee'), R.assoc('shippingFee'));
          const totalLens = R.lens(R.prop('total'), R.assoc('total'));

          const setShipping = R.set(shippingLens);
          const setTotal = R.set(totalLens);

          const total = R.view(totalLens)(summaryObj);

          // const address = await Addresses.findOne({ where: { id: addressId } });

          /**
           * Get shipping fee based on address, return it
           */
          const newShipping = 5;
          const newTotal = R.add(total, newShipping);

          const newSummary = R.pipe(setShipping(newShipping), setTotal(newTotal))(summaryObj);

          return Promise.resolve(newSummary);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const addTax = async summaryObj => {
        try {
          const taxLens = R.lens(R.prop('tax'), R.assoc('tax'));
          const totalLens = R.lens(R.prop('total'), R.assoc('total'));

          const setTax = R.set(taxLens);
          const setTotal = R.set(totalLens);

          const total = R.view(totalLens, summaryObj);

          /**
           * Tax Calculation here
           */

          const newTax = 6;
          const newTotal = R.add(newTax, total);

          const newSummary = R.pipe(setTax(newTax), setTotal(newTotal))(summaryObj);

          return Promise.resolve(newSummary);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const newSummary = await R.pipeP(addSubTotal, addShippingFee, addTax)(summary);

      return resolve(newSummary);
    } catch (e) {
      return reject(e);
    }
  });
