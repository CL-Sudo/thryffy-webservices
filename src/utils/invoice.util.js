/* eslint-disable no-param-reassign */
import _ from 'lodash';
import moment from 'moment';
import t from 'typy';
import sequelize, { Op } from 'sequelize';
import { generatePDF } from '@tools/wkhtmltopdf';
import { SequelizeConnector as db } from '@configs/sequelize-connector.config';
import { main, content, pageBreak } from '@templates/invoice.template';
import * as Models from '@models';
import { getQuarterlyMonths, asyncForEach, parseDate } from '@utils';
import { INVOICE_TYPES, TAXONOMY } from '@constants';

export const generateInvoice = (params = {}) =>
  new Promise(async (resolve, reject) => {
    let { transaction } = params;
    let manualTransaction = false;
    if (!transaction) {
      transaction = await db.transaction();
      manualTransaction = true;
    }

    try {
      const {
        debtorId,
        debtorItemIds = [],
        debtorInfo,
        headquarterInfo,
        debtorItemEffectiveFrom
      } = params;
      const { batchId = null, initialInvoice = false, autoGen = false, createdBy = null } = params;
      const {
        invoiceMonth = new Date().getMonth() + 1,
        invoiceYear = new Date().getFullYear()
      } = params;

      let debtor = debtorInfo;
      let invoice = null;
      const errors = [];

      if (!_.isEmpty(debtorItemIds)) {
        const debtorItems = await Models.DebtorItems.findAll({
          where: { id: debtorItemIds },
          include: { model: Models.InvoiceItems, as: 'invoiceItems' },
          transaction
        });
        if (_.isEmpty(debtorItems))
          throw new Error(
            `Failed to generate invoice. Debtor items not founds. [${_.join(debtorItemIds, ', ')}]`
          );
        if (initialInvoice) {
          _.map(debtorItems, di => {
            const { invoiceItems } = di;
            if (!_.isEmpty(invoiceItems)) {
              const serialNo = t(di, 'debtorItemRevisions[0].item.serialNo').safeObject;
              throw new Error(`${serialNo}'s initial invoice has already generated`);
            }
          });
        }
      }

      if (!debtor) {
        debtor = await Models.Debtors.findOne({
          where: { id: debtorId },
          attributes: ['id', 'name', 'category'],
          include: [
            { model: Models.ParkingSites, as: 'parkingSite', attributes: ['code', 'name', 'id'] },
            { model: Models.InvoiceFrequencies, as: 'invoiceFrequency', attributes: ['frequency'] }
          ]
        });
        if (!debtor) throw new Error('Debtor not found');
      }

      if (autoGen) {
        const invoices = await Models.Invoices.findAll({
          where: { type: INVOICE_TYPES.INVOICE, debtorId: debtor.id },
          getOutstanding: true,
          getPeriod: true,
          include: {
            model: Models.InvoiceMonths,
            as: 'invoiceMonths',
            required: true,
            where: { outstandingAmount: { [Op.gt]: 0 } },
            include: {
              model: Models.InvoiceItems,
              as: 'invoiceItems'
            }
          }
        });
        const totalOutstanding = _.sumBy(invoices, 'outstandingAmount');
        if (totalOutstanding > 0) {
          throw new Error(
            `Debtor[${debtor.id}]: '${debtor.name}' still have total of ${totalOutstanding} outstanding invoices amount.`
          );
        }
      }

      let invoiceDates = [new Date(`${invoiceYear}-${invoiceMonth}-01`)];
      const invoiceFrequency = _.get(debtor, 'invoiceFrequency.frequency', null);
      if (invoiceFrequency === null || invoiceFrequency === undefined)
        throw new Error(`Debtor ${debtor.name}'s invoice frequency not found`);
      if (invoiceFrequency === 0 && autoGen)
        throw new Error(
          'Auto invoice generator would not generate for zero month frequency invoice'
        );
      if (invoiceFrequency === 3)
        invoiceDates = getQuarterlyMonths(invoiceMonth, invoiceYear, { force: initialInvoice });

      const debtorItemsCount = await Models.DebtorItems.count({
        where: { debtorId: debtor.id, active: true },
        transaction
      });
      if (debtorItemsCount === 0) throw new Error('No item found');

      let headquarter = headquarterInfo;
      if (!headquarter) headquarter = await Models.Headquarter.findOne();

      const invoicePeriods = _.map(
        invoiceDates,
        d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      );
      invoice = await Models.Invoices.create(
        {
          type: INVOICE_TYPES.INVOICE,
          batchId,
          debtorId: debtor.id,
          parkingSiteId: debtor.dataValues.parkingSite.id,
          debtorName: debtor.dataValues.name,
          debtorCategory: debtor.dataValues.category,
          parkingSiteCode: debtor.dataValues.parkingSite.code,
          parkingSiteName: debtor.dataValues.parkingSite.name,
          taxRate: headquarter.calculationTaxRate,
          taxDescription: headquarter.taxDescription,
          period: JSON.stringify(invoicePeriods),
          createdBy
        },
        { transaction }
      );

      const sorItemsByMonths = [];
      let created = 0;

      // START - Loop and create Invoice Months
      await asyncForEach(invoiceDates, async date => {
        const { items: debtorItems, sorItems, generatedItems } = await getDebtorItems(
          debtor.id,
          date,
          debtorItemIds,
          {
            transaction,
            customEffectiveFrom: debtorItemEffectiveFrom
          }
        );

        // eslint-disable-next-line consistent-return
        _.map(debtorItems, di => {
          const { commencementDate, cancelledOn, debtorItemRevisions } = di;
          const { item } = debtorItemRevisions[0];
          if (cancelledOn) {
            return errors.push(
              `(${
                item.serialNo
              }: Cannot create invoice for cancelled item, item cancelled on ${parseDate(
                cancelledOn
              )})`
            );
          }
          const c = new Date(commencementDate);
          const cmD = new Date(`${c.getFullYear()}-${c.getMonth() + 1}`);
          if (date < cmD) {
            return errors.push(
              `Invoice period [${date.getFullYear()} ${
                moment.months()[date.getMonth()]
              }]: Cannot create invoice before commencement date (${commencementDate}).`
            );
          }
        });

        // Check is invoice generated
        if (_.isEmpty(debtorItems) && !_.isEmpty(generatedItems)) {
          errors.push(
            `Invoice for ${moment.months()[date.getMonth()]} ${date.getFullYear()} was generated.`
          );
          return;
        }
        if (!_.isEmpty(errors)) return;

        if (_.isEmpty(debtorItems)) {
          errors.push(
            `Error: [${date.getFullYear()} ${moment.months()[date.getMonth()]}] No passcard found.`
          );
          return;
        }

        if (errors.length > 0) return;

        const invoiceMonthObj = await Models.InvoiceMonths.create(
          {
            invoiceId: invoice.id,
            period: date,
            taxRate: headquarter.getTaxRate,
            taxDescription: headquarter.taxDescription
          },
          { transaction }
        );

        // Create Invoice Items
        await Promise.all(
          _.map(debtorItems, async debtorItem => {
            const { debtorItemRevisions } = debtorItem;
            if (debtorItemRevisions.length <= 0) throw new Error('Item revision not found');

            const { item, seasonType } = debtorItemRevisions[0];
            if (!item) throw new Error('Item not found');
            if (!seasonType) throw new Error('SeasonType not found');

            const { itemType } = item;
            if (!itemType) throw new Error('itemType not found');
            const vehicleType = await Models.VehicleTypes.findOne({
              where: { id: seasonType.vehicleTypeId }
            });
            if (!vehicleType) throw new Error('vehicleType not found');

            const invoiceItemsCount = await Models.InvoiceItems.count({
              where: { debtorItemId: debtorItem.id },
              transaction
            });
            if (!initialInvoice && invoiceItemsCount === 0)
              throw new Error('Cannot generate initial invoice on batch invoice generation');
            if (invoiceItemsCount === 0) {
              // Create Deposit Invoice Item
              const { deposit: seasonTypeDeposit } = seasonType;
              const deposit = seasonTypeDeposit;
              await Models.InvoiceItems.create(
                {
                  invoiceMonthId: invoiceMonthObj.id,
                  debtorItemId: debtorItem.id,
                  itemId: item.id,
                  seasonTypeId: seasonType.id,
                  itemTypeId: itemType.id,
                  period: date,
                  isDeposit: true,
                  name: 'Deposit',
                  unitPrice: deposit,
                  subtotal: deposit,
                  total: deposit,
                  // Snapshots: debtor-items
                  commencementDate: debtorItem.commencementDate,
                  halfMonth: debtorItem.halfMonth,
                  // Snapshots: debtor-item-revisions
                  carRegistrationNo: debtorItemRevisions[0].carRegistrationNo,
                  carMake: debtorItemRevisions[0].carMakeInfo
                    ? debtorItemRevisions[0].carMakeInfo.title
                    : null,
                  carModel: debtorItemRevisions[0].carModel,
                  username: debtorItemRevisions[0].username,
                  itemSerialNo: item.serialNo,
                  itemTypeCode: itemType.code,
                  itemTypeDescription: itemType.description,
                  seasonTypeName: seasonType.name,
                  seasonTypeDescription: seasonType.description,
                  seasonTypeAmount: seasonType.amount,
                  seasonTypeDuration: seasonType.duration,
                  seasonTypeDeposit: seasonType.deposit,
                  seasonTypeVehicleTypeId: vehicleType.id,
                  vehicleTypeCode: vehicleType.code,
                  vehicleTypeDescription: vehicleType.description
                },
                { transaction, customEffectiveFrom: debtorItemEffectiveFrom }
              );

              await Models.DebtorItemRevisions.update(
                { deposit },
                { where: { id: debtorItemRevisions[0].id }, transaction }
              );
            }

            const taxRate = headquarter.getTaxRate;
            const unitPrice = seasonType.amount;
            let subtotal = unitPrice;
            if (invoiceItemsCount === 0 && debtorItem.halfMonth) subtotal /= 2;
            const taxTotal = subtotal * taxRate;

            await Models.InvoiceItems.create(
              {
                invoiceMonthId: invoiceMonthObj.id,
                debtorItemId: debtorItem.id,
                itemId: item.id,
                seasonTypeId: seasonType.id,
                itemTypeId: itemType.id,
                period: date,
                unitPrice,
                taxRate,
                taxTotal,
                subtotal,
                total: subtotal + taxTotal,
                // Snapshots: debtor-items
                commencementDate: debtorItem.commencementDate,
                halfMonth: invoiceItemsCount === 0 ? debtorItem.halfMonth : null,
                // Snapshots: debtor-item-revisions
                carRegistrationNo: debtorItemRevisions[0].carRegistrationNo,
                carMake: debtorItemRevisions[0].carMakeInfo
                  ? debtorItemRevisions[0].carMakeInfo.title
                  : null,
                carModel: debtorItemRevisions[0].carModel,
                username: debtorItemRevisions[0].username,
                itemSerialNo: item.serialNo,
                itemTypeCode: itemType.code,
                itemTypeDescription: itemType.description,
                seasonTypeName: seasonType.name,
                seasonTypeDescription: seasonType.description,
                seasonTypeAmount: seasonType.amount,
                seasonTypeDuration: seasonType.duration,
                seasonTypeDeposit: seasonType.deposit,
                seasonTypeVehicleTypeId: vehicleType.id,
                vehicleTypeCode: vehicleType.code,
                vehicleTypeDescription: vehicleType.description
              },
              { transaction, customEffectiveFrom: debtorItemEffectiveFrom }
            );

            created++;
          })
        );

        // Update Invoice Month total
        const invoiceItemsSubTotal = await Models.InvoiceItems.sum('subtotal', {
          where: { invoiceMonthId: invoiceMonthObj.id },
          transaction
        });
        const invoiceItemsTaxTotal = await Models.InvoiceItems.sum('taxTotal', {
          where: { invoiceMonthId: invoiceMonthObj.id },
          transaction
        });
        const invoiceItemsTotal = await Models.InvoiceItems.sum('total', {
          where: { invoiceMonthId: invoiceMonthObj.id },
          transaction
        });
        await invoiceMonthObj.update(
          {
            total: invoiceItemsTotal,
            taxTotal: invoiceItemsTaxTotal,
            subtotal: invoiceItemsSubTotal,
            outstandingAmount: invoiceItemsTotal
          },
          { transaction }
        );

        // Check sor items
        if (!_.isEmpty(sorItems)) {
          sorItemsByMonths.push({ invoiceMonth: invoiceMonthObj, sorItems });
        }
      });
      // END - Loop and create Invoice Months
      if (created === 0) {
        if (_.isEmpty(errors)) throw new Error('No invoice has been generated');
        throw new Error(_.join(errors, '\n'));
      }

      // START - Update invoice amount
      const invoiceSubTotal = await Models.InvoiceMonths.unscoped().sum('subtotal', {
        where: { invoiceId: invoice.id },
        transaction
      });
      const invoiceTotal = await Models.InvoiceMonths.unscoped().sum('total', {
        where: { invoiceId: invoice.id },
        transaction
      });
      const invoiceTaxTotal = await Models.InvoiceMonths.unscoped().sum('taxTotal', {
        where: { invoiceId: invoice.id },
        transaction
      });
      await invoice.update(
        {
          subtotal: invoiceSubTotal,
          taxTotal: invoiceTaxTotal,
          grandTotal: invoiceTotal,
          outstandingAmount: invoiceTotal
        },
        { transaction }
      );
      // END - Update invoice amount

      // Create Credit Note for SOR Items
      if (!_.isEmpty(sorItemsByMonths)) {
        const creditNote = await Models.CreditNotes.create(
          {
            parkingSiteId: invoice.parkingSiteId,
            invoiceId: invoice.id,
            date: invoice.createdAt,
            taxRate: invoice.getTaxRate,
            taxDescription: invoice.taxDescription,
            createdBy
          },
          { transaction }
        );
        await Promise.all(
          _.map(sorItemsByMonths, async obj => {
            const { invoiceMonth: invoiceMonthObj, sorItems } = obj;
            if (_.isEmpty(invoiceMonthObj))
              throw new Error('Create credit note: invoiceMonthObj cannot be null');
            const creditMonth = await Models.CreditNoteMonths.create(
              {
                creditNoteId: creditNote.id,
                invoiceMonthId: invoiceMonthObj.id,
                taxRate: invoiceMonthObj.getTaxRate
              },
              { transaction }
            );

            await Promise.all(
              _.map(sorItems, async sor => {
                const { sorId, debtorItemId } = sor;
                const invItem = await Models.InvoiceItems.findOne({
                  where: { invoiceMonthId: invoiceMonthObj.id, debtorItemId },
                  attributes: ['id', 'quantity', 'unitPrice', 'total', 'period'],
                  transaction
                });
                await Models.CreditNoteItems.create(
                  {
                    creditNoteMonthId: creditMonth.id,
                    quantity: invItem.quantity,
                    unitPrice: invItem.unitPrice,
                    taxRate: invoiceMonthObj.getTaxRate,
                    description: `Suspension for ${
                      invItem.period ? moment(invItem.period, 'YYYY-MM-DD').format('MMM YYYY') : ''
                    }`,
                    sorId,
                    invoiceItemId: invItem.id
                  },
                  { transaction }
                );
              })
            );

            const creditItemsSubTotal = await Models.CreditNoteItems.sum('subtotal', {
              where: { creditNoteMonthId: creditMonth.id },
              transaction
            });
            const creditItemsTaxTotal = await Models.CreditNoteItems.sum('taxTotal', {
              where: { creditNoteMonthId: creditMonth.id },
              transaction
            });
            const creditItemsTotal = await Models.CreditNoteItems.sum('total', {
              where: { creditNoteMonthId: creditMonth.id },
              transaction
            });
            await creditMonth.update(
              {
                total: creditItemsTotal,
                taxTotal: creditItemsTaxTotal,
                subtotal: creditItemsSubTotal
              },
              { transaction }
            );

            await Models.InvoiceMonths.decrement('outstandingAmount', {
              by: creditItemsTotal,
              where: { id: creditMonth.invoiceMonthId },
              transaction
            });
          })
        );

        const subtotal = await Models.CreditNoteMonths.unscoped().sum('subtotal', {
          where: { creditNoteId: creditNote.id },
          transaction
        });
        const taxTotal = await Models.CreditNoteMonths.unscoped().sum('taxTotal', {
          where: { creditNoteId: creditNote.id },
          transaction
        });
        const total = await Models.CreditNoteMonths.unscoped().sum('total', {
          where: { creditNoteId: creditNote.id },
          transaction
        });
        await creditNote.update({ subtotal, taxTotal, grandTotal: total }, { transaction });
      }

      if (manualTransaction) await transaction.commit();
      return resolve({ invoice, errors });
    } catch (e) {
      if (manualTransaction) await transaction.rollback();
      return reject(e);
    }
  });

const getDebtorItems = (debtorId, date, itemIds = [], { transaction, customEffectiveFrom }) =>
  new Promise(async (resolve, reject) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const query = `
        SELECT di.id, sor.id as sorId, ii.id as invoiceItemId FROM debtor_items di
        LEFT JOIN suspension_requests sor ON di.id = sor.debtor_item_id AND '${year}-${month}-1' BETWEEN start_month AND end_month AND sor.deleted_at IS NULL
        LEFT JOIN invoice_items ii ON di.id = ii.debtor_item_id AND YEAR(period)=${year} AND MONTH(period)=${month} AND ii.deleted_at IS NULL
        WHERE di.debtor_id = ${debtorId} AND di.active = true AND (di.cancelled_on > '${year}-${month}-1' OR di.cancelled_on IS NULL) AND di.deleted_at IS NULL
        AND (di.cancelled_on IS NULL OR di.cancelled_on > '${year}-${month}-1')
        ${!_.isEmpty(itemIds) ? `AND di.id IN (${itemIds})` : ''}
        `;

      const ids = [];
      // const sorItemIds = [];
      const sorItems = [];
      const generatedItemIds = [];
      await db.query(query, { transaction }).spread(results => {
        results.forEach(row => {
          if (row.invoiceItemId === null) {
            ids.push(row.id);
          } else {
            generatedItemIds.push(row.id);
          }
          // For Create Credit Note
          // if (row.sorId) sorItemIds.push(row.id);
          if (row.sorId) sorItems.push({ sorId: row.sorId, debtorItemId: row.id });
        });
      });

      const debtorItemsIncludes = [
        {
          model: Models.DebtorItemRevisions,
          as: 'debtorItemRevisions',
          limit: 1,
          order: [['createdAt', 'DESC']],
          required: true,
          where: {
            [Op.or]: [
              { effectiveFrom: null },
              { effectiveFrom: { [Op.gte]: customEffectiveFrom || sequelize.fn('now') } }
            ]
          },
          include: [
            {
              model: Models.Items,
              as: 'item',
              include: { model: Models.ItemTypes, as: 'itemType' }
            },
            { model: Models.SeasonTypes, as: 'seasonType' },
            { model: Models.Categories, as: TAXONOMY.CAR_MAKE.alias }
          ]
        }
      ];

      const items = _.isEmpty(ids)
        ? []
        : await Models.DebtorItems.findAll({
            where: { id: ids },
            transaction,
            include: debtorItemsIncludes
          });

      const generatedItems = _.isEmpty(generatedItemIds)
        ? []
        : await Models.DebtorItems.findAll({
            where: { id: generatedItemIds },
            transaction,
            include: debtorItemsIncludes
          });
      return resolve({ items, sorItems, generatedItems });
    } catch (e) {
      return reject(e);
    }
  });

export const generateInvoicePDFStream = ({
  where = null,
  transaction,
  headquarter,
  employee
} = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const invoices = await Models.Invoices.findAll({
        where,
        include: [
          { model: Models.InvoiceMonths, as: 'invoiceMonths' },
          {
            model: Models.ParkingSites,
            as: 'parkingSite',
            include: [{ model: Models.Banks, as: 'bank' }]
          },
          { model: Models.Debtors, as: 'debtor' },
          { model: Models.Receipts, as: 'receipts' },
          { model: Models.DebitNotes, as: 'debitNotes' },
          { model: Models.CreditNotes, as: 'creditNotes' },
          { model: Models.Employees, as: 'createdByInfo' }
        ],
        transaction: transaction || null
      });
      if (!invoices) return reject(new Error('Invoice not found'));

      let hq;
      if (headquarter) hq = headquarter;
      hq = await Models.Headquarter.findOne();

      let contentValue;
      _.map(invoices, inv => {
        const newContent = content(inv, hq, { employee, now: moment() });
        if (contentValue) {
          contentValue += pageBreak;
          contentValue += newContent;
        } else {
          contentValue = newContent;
        }
      });

      const template = main(contentValue);
      const stream = generatePDF(template, { pageSize: 'a4' });

      const invoice = invoices[0];
      return resolve({ stream, invoices, invoice });
    } catch (e) {
      return reject(e);
    }
  });

export const getInvoicePeriod = invoiceMonths => {
  let result = '';
  let count = 0;

  const data = [];
  _.map(invoiceMonths, val => {
    // const date = moment(obj.period || obj.createdAt, 'YYYY-MM-DD');
    // data.push({ year: date.format('YYYY'), month: date.format('MMM') });
    let value = val;
    if (_.isObject(val)) value = val.period || val.createdAt;
    const date = moment(value, 'YYYY-MM-DD');
    data.push({ year: date.format('YYYY'), month: date.format('MMM') });
  });

  const grouped = _.groupBy(data, 'year');
  const formated = [];
  _.mapValues(grouped, val => formated.push(val));
  _.map(formated, (val, key) => {
    let months = '';
    let year;
    _.map(val, (date, key1) => {
      // eslint-disable-next-line prefer-destructuring
      year = date.year;
      if (key1 > 0) months += '-';
      months += date.month;
    });
    if (key > 0) result += ', ';
    result += `${months}-${year}`;
    count += 1;
  });

  return { toString: () => result, count };
};
