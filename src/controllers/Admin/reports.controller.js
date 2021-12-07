import _ from 'lodash';
import moment from 'moment';
import Excel from 'exceljs';

import { Users, SalesOrders, ShippingFees, Products, OrderItems } from '@models';

import { generateHtmlString, registerTablePartial } from '@tools/handlebars';
import { generatePDF } from '@tools/wkhtmltopdf';

import { downloadStream } from '@utils/utils';
import { parseDate } from '@utils';
import { dateRangeQuery } from '@utils/query.util';

import { DELIVERY_STATUS } from '@constants';

const BANKS = [
  'Affin Bank Berhad',
  'Alliance Bank',
  'Am Bank',
  'Bank Islam',
  'Bank Muamalat',
  'Bank Rakyat',
  'Bank Simpanan Nasional',
  'CIMB Bank',
  'Citibank',
  'Hong Leong Bank',
  'Maybank',
  'OCBC Bank',
  'Public Bank',
  'RHB Bank',
  'Standard Chartered Bank'
];

export const exportOrderToExcel = async (req, res, next) => {
  try {
    const { from = '2000-01-01', to = moment().format('YYYY-MM-DD HH:mm:ss') } = req.query;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      {
        key: 'beneficiaryName',
        header: 'Beneficiary Name'
      },
      {
        key: 'beneficiaryBank',
        header: 'Beneficiary Bank'
      },
      {
        key: 'beneficiaryAccountNo',
        header: 'Beneficiary Account No'
      },
      {
        key: 'identityType',
        header: 'Identity Type'
      },
      {
        key: 'identityNo',
        header: 'Identity Number'
      },
      {
        key: 'paymentAmount',
        header: 'Payment Amount'
      },
      {
        key: 'paymentRef',
        header: 'Payment Reference'
      },
      {
        key: 'paymentDescription',
        header: 'Payment Description'
      },
      {
        key: 'orderRef',
        header: 'Order Reference'
      },
      {
        key: 'parcelType',
        header: 'Parcel Type'
      },
      {
        key: 'paymentStatus',
        header: 'Payment Status'
      },
      {
        key: 'deliveryStatus',
        header: 'Delivery Status'
      },
      {
        key: 'deliveryTrackingNo',
        header: 'Tracking No.'
      },
      {
        key: 'subTotal',
        header: 'Sub Total'
      },
      {
        key: 'shippingFee',
        header: 'Shipping Fee'
      },
      {
        key: 'tax',
        header: 'Tax'
      },
      {
        key: 'total',
        header: 'Total'
      },
      {
        key: 'commission',
        header: 'Commission'
      },
      {
        key: 'isCommissionPaid',
        header: 'Is Commision Paid'
      },
      {
        key: 'commissionPaidAt',
        header: 'Commission Paid At'
      },
      {
        key: 'createdAt',
        header: 'Created At'
      }
    ];

    worksheet.insertRow(1, ['From:', parseDate(new Date(from))]);
    worksheet.insertRow(2, ['To:', parseDate(new Date(to))]);
    worksheet.insertRow(3, []);
    worksheet.insertRow(4, ['Employer Info:']);
    worksheet.insertRow(5, ['Crediting Date:', parseDate(new Date())]);
    worksheet.insertRow(6, ['Payment Reference:', 'Ecommerce']);
    worksheet.insertRow(7, ['Payment Description:', 'Sale on Thryffy']);
    worksheet.insertRow(8, ['Bulk Payment Type:', 'Online Banking']);
    worksheet.insertRow(9, []);

    worksheet.getCell('A1').font = { bold: true };
    worksheet.getCell('A2').font = { bold: true };
    worksheet.getCell('A3').font = { bold: true };
    worksheet.getCell('A4').font = { bold: true };

    worksheet.mergeCells('D3', 'H3');
    worksheet.getCell('D3').value =
      'Please save this template to .csv (comma delimited) file before uploading the file via M2U Biz';
    worksheet.getCell('D3').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    worksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
    });
    worksheet.getRow(1).font = { bold: true };

    const dateRange = dateRangeQuery('createdAt')({ from, to });
    const order = await SalesOrders.findAll({
      where: { ...dateRange, deliveryStatus: DELIVERY_STATUS.COMPLETED },
      include: [
        { model: Users, as: 'seller' },
        { model: ShippingFees, as: 'shippingFee' },
        { model: OrderItems, as: 'orderItems', include: [{ model: Products, as: 'product' }] }
      ],
      order: [['createdAt', 'ASC']]
    });

    const data = _.map(order, instance => {
      const productPrice = _.sum(instance.orderItems.map(item => item.product.originalPrice));

      instance.dataValues.createdAt = parseDate(instance.dataValues.createdAt);
      instance.dataValues.deliveryTrackingNo = instance.deliveryTrackingNo || 'NA';
      instance.dataValues.commissionPaidAt = instance.commissionPaidAt || 'NA';
      instance.dataValues.isCommissionPaid = instance.isCommissionPaid ? 'Yes' : 'No';

      const obj = {
        ...instance.dataValues,
        beneficiaryName: _.get(instance, 'seller.beneficiaryName', 'NA'),
        beneficiaryBank: _.get(instance, 'seller.beneficiaryBank', 'NA'),
        beneficiaryAccountNo: _.get(instance, 'seller.bankAccountNo', 'NA'),
        identityType: _.get(instance, 'seller.identityType', 'NA'),
        identityNo: _.get(instance, 'seller.identityNo', 'NA'),
        paymentAmount: productPrice - instance.commission + instance.shippingFee.actualPrice,
        paymentRef: 'Ecommerce',
        paymentDescription: 'Sale on Thryffy',
        parcelType: _.get(instance, 'seller.parcelName', 'NA'),
        shippingFee: _.get(instance, 'shippingFee.price', 0).toFixed(2)
      };
      return obj;
    });

    data.forEach(instance => {
      worksheet.addRow({
        ...instance
      });
    });

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 3 && rowNumber < 9) {
        worksheet.getCell(`A${rowNumber}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        worksheet.getCell(`B${rowNumber}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }

      if (rowNumber > 10) {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          if (colNumber === 4) {
            cell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: ['"NRIC,Old IC, Passport,BRN Police ID,Army ID"']
            };
          }

          if (colNumber === 2) {
            cell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: [
                '"Affin Bank Berhad, Alliance Bank, Am Bank, Bank Islam, Bank Muamalat, Bank Rakyat, Bank Simpanan Nasional, CIMB Bank, Citibank, Hong Leong Bank, Maybank, OCBC Bank, Public Bank, RHB Bank, Standard Chartered Bank"'
              ]
            };
          }
        });
      }

      worksheet.getRow(10).font = { bold: true };

      // const insideColumns = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
      // insideColumns.forEach(v => {
      //   worksheet.getCell(`${v}${rowNumber}`).border = {
      //     top: { style: 'thin' },
      //     bottom: { style: 'thin' },
      //     left: { style: 'none' },
      //     right: { style: 'none' }
      //   };
      // });

      // worksheet.getCell(`F${rowNumber}`).border = {
      //   top: { style: 'thin' },
      //   left: { style: 'none' },
      //   bottom: { style: 'thin' },
      //   right: { style: 'thin' }
      // };
    });

    const fileName = `order_list_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);

    // return res.download(fileName);
    // return workbook.csv.write(res).then(() => {
    //   res.status(200).end();
    // });
  } catch (e) {
    return next(e);
  }
};

export const orderListing = async (req, res, next) => {
  try {
    // const { id } = req.user;
    const id = _.get(req, 'user.id', 2);

    const { from = '2021-01-02', to = '2021-01-04' } = req.query;
    const dateRange = dateRangeQuery('createdAt')({ from, to });
    const order = await SalesOrders.findAll({
      where: { ...dateRange },
      include: [
        { model: Users, as: 'seller' },
        { model: ShippingFees, as: 'shippingFee' }
      ],
      order: [['createdAt', 'ASC']]
    });

    const rows = _.map(order, instance => {
      instance.dataValues.createdAt = parseDate(instance.dataValues.createdAt);
      instance.dataValues.deliveryTrackingNo = instance.deliveryTrackingNo || 'NA';
      instance.dataValues.commissionPaidAt = instance.commissionPaidAt || 'NA';
      instance.dataValues.isCommissionPaid = instance.isCommissionPaid ? 'Yes' : 'No';

      const obj = {
        ...instance.dataValues,
        shippingFee: _.get(instance, 'shippingFee.price', 0).toFixed(2)
      };
      return obj;
    });

    const columns = [
      {
        dataIndex: 'orderRef',
        title: 'Order Reference',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'parcelType',
        title: 'Parcel Type',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'paymentStatus',
        title: 'Payment Status',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'deliveryStatus',
        title: 'Delivery Status',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'deliveryTrackingNo',
        title: 'Tracking No.',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'subTotal',
        title: 'Sub Total',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'shippingFee',
        title: 'Shipping Fee',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'tax',
        title: 'Tax',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'total',
        title: 'Total',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'commission',
        title: 'Commission',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'isCommissionPaid',
        title: 'Is Commision Paid',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'commissionPaidAt',
        title: 'Commission Paid At',
        class: 'text-center',
        rowClass: 'text-center'
      },
      {
        dataIndex: 'createdAt',
        title: 'Created At',
        class: 'text-center',
        rowClass: 'text-center'
      }
    ];

    let dataSource = _.groupBy(rows, data => data.createdAt);

    _.mapKeys(dataSource, (val, key) => {
      dataSource[key] = {
        value: val
      };
    });

    const orderedDataSource = {};
    dataSource = Object.keys(dataSource)
      .sort()
      .forEach(key => {
        orderedDataSource[key] = dataSource[key];
      });

    await registerTablePartial({
      columns,
      dataSource: orderedDataSource,
      isObject: 'true',
      withRowKey: 'true'
    });

    const htmlString = await generateHtmlString({
      templatePath: 'order_report.template.html',
      headerData: { title: 'Order Report', user: 'admin' }
    });
    const stream = generatePDF(htmlString, {
      orientation: 'Landscape',
      footerRight: 'Page [page] of [topage]'
    });
    const filename = `List_of_user_${moment().format('YYYY-MM-DD HH:mm:ss')}.pdf`;
    return downloadStream(res, stream, filename);
  } catch (e) {
    return next(e);
  }
};
