import _ from 'lodash';
import moment from 'moment';
import Excel from 'exceljs';

import { Users, SalesOrders, ShippingFees, Admins } from '@models';

import { generateHtmlString, registerTablePartial } from '@tools/handlebars';
import { generatePDF } from '@tools/wkhtmltopdf';

import { downloadStream } from '@utils/utils';
import { parseDate } from '@utils';
import { dateRangeQuery } from '@utils/query.util';

export const exportOrderToExcel = async (req, res, next) => {
  try {
    const { from = '2000-01-01', to = moment().format('YYYY-MM-DD') } = req.query;
    const id = _.get(req, 'user.id', 2);

    const admin = await Admins.findOne({ where: { id } });

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
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

    worksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
    });
    worksheet.getRow(1).font = { bold: true };

    worksheet.insertRow(1, ['Order Report']);
    worksheet.insertRow(2, []);
    worksheet.insertRow(3, ['From:', parseDate(new Date(from))]);
    worksheet.insertRow(4, ['To:', parseDate(new Date(to))]);
    worksheet.insertRow(5, []);
    worksheet.insertRow(6, ['Report Requester:', admin.username]);
    worksheet.insertRow(7, ['Report Release Date:', parseDate(new Date())]);
    worksheet.insertRow(8, []);

    worksheet.getCell('A1').font = { bold: true, size: 20 };
    worksheet.getCell('A3').font = { bold: true };
    worksheet.getCell('A4').font = { bold: true };
    worksheet.getCell('A6').font = { bold: true };
    worksheet.getCell('A7').font = { bold: true };

    const dateRange = dateRangeQuery('createdAt')({ from, to });
    const order = await SalesOrders.findAll({
      where: { ...dateRange },
      include: [
        { model: Users, as: 'seller' },
        { model: ShippingFees, as: 'shippingFee' }
      ],
      order: [['createdAt', 'ASC']]
    });

    const data = _.map(order, instance => {
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

    data.forEach(instance => {
      worksheet.addRow({
        ...instance
      });
    });

    // worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    //   worksheet.getCell(`A${rowNumber}`).border = {
    //     top: { style: 'thin' },
    //     left: { style: 'thin' },
    //     bottom: { style: 'thin' },
    //     right: { style: 'none' }
    //   };

    //   const insideColumns = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
    //   insideColumns.forEach(v => {
    //     worksheet.getCell(`${v}${rowNumber}`).border = {
    //       top: { style: 'thin' },
    //       bottom: { style: 'thin' },
    //       left: { style: 'none' },
    //       right: { style: 'none' }
    //     };
    //   });

    //   worksheet.getCell(`F${rowNumber}`).border = {
    //     top: { style: 'thin' },
    //     left: { style: 'none' },
    //     bottom: { style: 'thin' },
    //     right: { style: 'thin' }
    //   };
    // });

    const fileName = `order_list_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
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
