import { Products } from '@models';
import R from 'ramda';
import { getShippingFee } from '@services';
import CHARGE from '@constants/shipping.constant';

export const getPriceSummary = async productIds =>
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
          const shippingLens = R.lens(R.prop('shippingFee'), R.assoc('shippingFee'));
          const totalLens = R.lens(R.prop('total'), R.assoc('total'));

          const setShipping = R.set(shippingLens);
          const setTotal = R.set(totalLens);

          const total = R.view(totalLens)(summaryObj);

          const newShipping = await getShippingFee(productIds);

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

          const { subTotal } = summaryObj;

          const newTax = subTotal * CHARGE.TAX_PERCENTAGE + CHARGE.TRANSACTION_FEE;

          const newTotal = R.add(newTax, total);

          const newSummary = R.pipe(setTax(newTax), setTotal(newTotal))(summaryObj);

          return Promise.resolve(newSummary);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const convertToTwoDecimalPlace = summaryObj => {
        const subTotalLens = R.lens(R.prop('subTotal'), R.assoc('subTotal'));
        const shippingLens = R.lens(R.prop('shippingFee'), R.assoc('shippingFee'));
        const taxLens = R.lens(R.prop('tax'), R.assoc('tax'));
        const totalLens = R.lens(R.prop('total'), R.assoc('total'));

        const setTax = R.set(taxLens);
        const setTotal = R.set(totalLens);
        const setShipping = R.set(shippingLens);
        const setSubTotal = R.set(subTotalLens);

        const { tax, subTotal, shippingFee, total } = summaryObj;

        const newSummary = R.pipe(
          setTax(tax.toFixed(2)),
          setShipping(shippingFee.toFixed(2)),
          setSubTotal(subTotal.toFixed(2)),
          setTotal(total.toFixed(2))
        )(summaryObj);

        return newSummary;
      };

      const newSummary = await R.pipeP(
        addSubTotal,
        addShippingFee,
        addTax,
        convertToTwoDecimalPlace
      )(summary);

      return resolve(newSummary);
    } catch (e) {
      return reject(e);
    }
  });
