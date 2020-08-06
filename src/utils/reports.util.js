import sequelize from 'sequelize';
import _ from 'lodash';
import moment from 'moment';
import { db } from '@configs/sequelize-connector.config';
import { getInvoicePeriod } from '@utils/invoice.util';
import * as Models from '@models';
import { INVOICE_TYPES, REPORT_INVOICE_TYPE } from '@constants';

export const createReportInvoice = async (month, year) =>
  new Promise(async (resolve, reject) => {
    try {
      const parkingSites = await Models.ParkingSites.findAll({
        include: {
          model: Models.Invoices,
          as: 'invoices',
          where: {
            [sequelize.Op.and]: [
              sequelize.where(
                sequelize.fn('YEAR', sequelize.col('`invoices`.`created_at`')),
                _.toNumber(year)
              ),
              sequelize.where(
                sequelize.fn('MONTH', sequelize.col('`invoices`.`created_at`')),
                _.toNumber(month)
              )
            ]
          },
          required: true,
          include: [
            { model: Models.Debtors, as: 'debtor', attributes: ['name'] },
            {
              model: Models.InvoiceMonths,
              as: 'invoiceMonths',
              attributes: ['id', 'total', 'period'],
              include: {
                model: Models.InvoiceItems,
                as: 'invoiceItems',
                attributes: ['total', 'isDeposit']
              }
            }
          ]
        },
        order: [[{ model: Models.Invoices, as: 'invoices' }, 'createdAt', 'ASC']]
      });

      await Promise.all(
        _.map(parkingSites, async parkingSite => {
          const { invoices, id: parkingSiteId } = parkingSite;
          await db.transaction(async transaction => {
            const report = await Models.ReportsInvoice.create(
              {
                type: REPORT_INVOICE_TYPE.Calendar,
                period: new Date(`${year}-${month}-2`),
                parkingSiteId
              },
              { transaction }
            );
            const items = [];
            _.map(invoices, inv => {
              const {
                debtor,
                invoiceMonths = [],
                createdAt,
                invNo,
                grandTotal,
                type,
                period
              } = inv;

              let depositTotal = 0;
              let description = 'N/A';
              let othersSt = 0;
              let others = 0;
              let rentalCurrent = 0;
              let rentalFuture = 0;

              if (type !== INVOICE_TYPES.INVOICE) {
                if (type === INVOICE_TYPES.SIMPLIFIED_TAX_INVOICE) {
                  othersSt += grandTotal;
                } else {
                  others += grandTotal;
                }
              } else {
                _.map(invoiceMonths, im => {
                  const { invoiceItems = [], total = 0 } = im;
                  let deposit = 0;
                  _.map(invoiceItems, item => {
                    if (item.isDeposit) deposit += item.total;
                  });
                  depositTotal += deposit;

                  if (moment(im.period, 'YYYY-MM-DD').format('M') === moment().format('M')) {
                    rentalCurrent += total - deposit;
                  } else {
                    rentalFuture += total - deposit;
                  }
                });
                if (period) description = getInvoicePeriod(JSON.parse(period)).toString();
              }

              items.push({
                reportId: report.id,
                parkingSiteName: parkingSite.name,
                debtorName: debtor.name,
                invoiceDate: createdAt,
                invoiceNo: invNo,
                amount: grandTotal,
                deposit: depositTotal,
                description,
                othersSt,
                others,
                rentalCurrent,
                rentalFuture
              });
            });
            await Models.ReportsInvoiceItems.bulkCreate(items, { transaction });
          });
        })
      );
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
