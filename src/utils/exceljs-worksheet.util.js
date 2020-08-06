/* eslint-disable no-param-reassign */
import Excel from 'src/utils/exceljs';
import moment from 'src/utils/moment';
import _ from 'src/utils/lodash';
import { Headquarter } from 'src/utils/@models';

const numberToLetter = i => _.toUpper(String.fromCharCode(96 + i));

const configureHeader = (worksheet, column, format = 'xlsx', { createdAt } = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const lastLetter = numberToLetter(column.length);
      const secondLastLetter = numberToLetter(column.length - 1);
      const headquarter = await Headquarter.findOne({ attributes: ['companyName', 'companyRegistrationNo'] });
      const { companyName, companyRegistrationNo } = headquarter;

      if (format === 'xlsx') worksheet.mergeCells('A1:B1');
      worksheet.getCell('A1').value = `${companyName} ${companyRegistrationNo || ''}`;
      worksheet.getCell('A1').font = { bold: true };
      if (format === 'xlsx') worksheet.mergeCells(`${secondLastLetter}1:${lastLetter}1`);
      if (createdAt) {
        let value;
        if (createdAt instanceof moment) {
          value = createdAt.format('DD/MM/YYYY hh:mm A');
        } else {
          value = moment(createdAt, 'YYYY-MM-DD').format('DD/MM/YYYY hh:mm A');
        }
        worksheet.getCell(`${format === 'csv' ? lastLetter : secondLastLetter}1`).value = value;
      }
      worksheet.getCell(`${secondLastLetter}1`).alignment = { vertical: 'middle', horizontal: 'right' };

      worksheet.addRow();
      worksheet.addRow();
      const tableHeader = worksheet.getRow(3);
      tableHeader.values = _.map(column, 'header');
      tableHeader.font = { bold: true };
      worksheet.columns = _.map(column, o => ({ ..._.omit(o, 'header') }));
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

export const createInvoiceReportsWorkbook = ({ format = 'xlsx', data, rows = [] }) =>
  new Promise(async (resolve, reject) => {
    try {
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('Invoice Details By Calendar');
      workbook.created = new Date();

      const tableColumns = [
        { header: 'Location', key: 'parkingSiteName', width: 26 },
        { header: 'Debtor', key: 'debtorName', width: 26 },
        { header: 'Invoice Date', key: 'invoiceDate', width: 16 },
        { header: 'Invoice No.', key: 'invoiceNo', width: 21 },
        { header: 'Description', key: 'description', width: 31 },
        { header: 'Amount', key: 'amount', width: 17 },
        { header: 'Deposit', key: 'deposit', width: 17 },
        { header: 'Rental - Current', key: 'rentalCurrent', width: 22 },
        { header: 'Rental - Future Month', key: 'rentalFuture', width: 22 },
        { header: 'Others with ST', key: 'othersSt', width: 18 },
        { header: 'Others without ST', key: 'others', width: 18 }
      ];

      await configureHeader(worksheet, tableColumns, format, { createdAt: _.get(data, 'createdAt', null) });

      worksheet.addRows(rows);
      worksheet.getRow(rows.length + 4).font = { bold: true };

      for (let i = 1; i <= 11; i++) {
        const letter = _.toUpper(String.fromCharCode(96 + i));
        const cell = worksheet.getCell(`${letter}3`);
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' }
        };
      }

      for (let i = 6; i <= 11; i++) {
        worksheet.getColumn(i).numFmt = '#,##0.00;[Red]-#,##0.00';
        const letter = numberToLetter(i);
        const cell = worksheet.getCell(`${letter}:${rows.length + 4}`);
        if (format !== 'csv') {
          cell.value = { formula: `SUM(${letter}4:${letter}${rows.length - 1 + 4})` };
        } else {
          const column = worksheet.getColumn(i);
          cell.value = _.sumBy(rows, column.key);
        }
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'double' }
        };
      }

      return resolve(workbook);
    } catch (e) {
      return reject(e);
    }
  });

export const createNewDebtorsReportsWorkbook = ({ rows = [] }) =>
  new Promise(async (resolve, reject) => {
    try {
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('New Debtors Listing');

      const tableColumns = [
        { header: 'Debtor Name', key: 'debtorName', width: 25 },
        { header: 'Category', key: 'category', width: 25 },
        { header: 'Start Date', key: 'startDate', width: 25 },
        { header: 'Item', key: 'item', width: 25 },
        { header: 'Season Type', key: 'seasonType', width: 25 },
        { header: 'Amount', key: 'amount', width: 25 },
        { header: 'Deposit', key: 'deposit', width: 25 },
        { header: 'Car Registration No', key: 'carRegistrationNo', width: 25 },
        { header: 'Status', key: 'status', width: 25 }
      ];

      await configureHeader(worksheet, tableColumns);
      worksheet.addRows(rows);
      return resolve(workbook);
    } catch (e) {
      return reject(e);
    }
  });
