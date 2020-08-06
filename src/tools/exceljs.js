import Excel from 'exceljs';
import _ from 'lodash';

export const getCSVData = (file, { type = 'xlsx', columnRowIndex = 1, formatter } = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const workbook = new Excel.Workbook();
      await workbook[type].readFile(file);
      const worksheet = workbook.getWorksheet();

      let columns;
      const data = [];
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const { values } = row;
        const src = {};
        if (rowNumber === columnRowIndex && !columns) {
          columns = _.map(row.values, _.camelCase);
        } else {
          values.map((val, key) => {
            let value = _.isString(val) ? val.replace(/'/g, '').trim() : val;
            if (_.isObject(value) && _.get(value, 'text')) value = value.text;
            src[columns[key]] = value;
            return true;
          });
          data.push(formatter ? formatter(src) : src);
        }
      });
      return resolve(data);
    } catch (e) {
      return reject(e);
    }
  });
