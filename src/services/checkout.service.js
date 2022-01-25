import { Products, ShippingFees } from '@models';
import R from 'ramda';
import { getShippingFee } from '@services';
import CHARGE from '@constants/shipping.constant';
import { COUNTRIES } from '@constants/countries.constant';

export const getPriceSummary = async productIds =>
  new Promise(async (resolve, reject) => {
    try {
      const summary = {
        shippingFeeId: null,
        subTotal: 0,
        shippingFee: {},
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
            where: {
              id: productIds
            }
          });

          const getPriceArr = R.map(R.prop('displayPrice'));
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
          const { price, id } = await getShippingFee(productIds);
          const shippingFeeObj = await ShippingFees.findOne({ where: { id } });

          const newTotal = R.add(summaryObj.total, price);

          const obj = {
            ...summaryObj,
            shippingFeeId: id,
            shippingFee: shippingFeeObj.get(),
            total: newTotal
          };

          return Promise.resolve(obj);
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

          // const { subTotal } = summaryObj;
          // const shippingFee = summaryObj.shippingFee.price;

          let newTax = 0;

          const product = await Products.findOne({
            include: ['country'],
            where: { id: productIds[0] }
          });

          if (product.country.code === COUNTRIES.MALAYSIA.CODE) {
            newTax = CHARGE.TRANSACTION_FEE;
          } else if (product.country.code === COUNTRIES.BRUNEI.CODE) {
            newTax = 0.99 + 0.05 * (summaryObj.subTotal + summaryObj.shippingFee.price);
          }

          // const newTax = (subTotal + shippingFee) * CHARGE.TAX_PERCENTAGE + CHARGE.TRANSACTION_FEE;

          const newTotal = R.add(newTax, total);

          const newSummary = R.pipe(setTax(newTax), setTotal(newTotal))(summaryObj);

          return Promise.resolve(newSummary);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const convertToTwoDecimalPlace = summaryObj => {
        const subTotalLens = R.lens(R.prop('subTotal'), R.assoc('subTotal'));
        // const shippingLens = R.lens(R.prop('shippingFee'), R.assoc('shippingFee'));
        const taxLens = R.lens(R.prop('tax'), R.assoc('tax'));
        const totalLens = R.lens(R.prop('total'), R.assoc('total'));

        const setTax = R.set(taxLens);
        const setTotal = R.set(totalLens);
        // const setShipping = R.set(shippingLens);
        const setSubTotal = R.set(subTotalLens);

        const { tax, subTotal, total } = summaryObj;

        const newSummary = R.pipe(
          setTax(tax.toFixed(2)),
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
