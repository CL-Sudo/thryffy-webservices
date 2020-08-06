/* eslint-disable no-param-reassign */
import fs from 'fs';
import path from 'path';
import util from 'util';
import Handlebars from 'handlebars';
import moment from 'moment';
import { Headquarter, Employees } from '@models';

const ReadFile = util.promisify(fs.readFile);
const templateFolderPath = './src/templates/';

let rowCount = 1;
Handlebars.registerHelper('rowCount', () => rowCount++);
Handlebars.registerHelper('incremented', index => {
  index++;
  return index;
});

export const { registerPartial } = Handlebars;
export const parseNextLine = text => new Handlebars.SafeString(text); // <br/>
export const br = `<br style="line-height:20px;"/>`;

export const generateHtmlString = async ({ templatePath, data, headerData }) =>
  new Promise(async (resolve, reject) => {
    try {
      rowCount = 1;
      await Promise.all([compileHeaderPartial(headerData), compileFooterPartial()]);
      const filePath = path.resolve(templateFolderPath, templatePath);
      const file = await ReadFile(filePath, 'utf8');
      const compiler = Handlebars.compile(file);
      const htmlString = compiler(data);
      return resolve(htmlString);
    } catch (error) {
      return reject(new Error('Failed create invoice HTML template.'));
    }
  });

export const registerTablePartial = async param =>
  new Promise(async (resolve, reject) => {
    try {
      const { partialName = 'table' } = param;
      const filePath = path.resolve(templateFolderPath, 'table.template.html');
      const file = await ReadFile(filePath, 'utf8');
      const compiledPartial = Handlebars.compile(file);
      const html = compiledPartial(param);
      Handlebars.registerPartial(partialName, html);
      return resolve(html);
    } catch (e) {
      return reject(e);
    }
  });

const compileHeaderPartial = (param = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const { userId } = param;
      let user = '';

      const headerStyleFile = await ReadFile(path.resolve(templateFolderPath, 'styles/header.scss'), 'utf8');
      const headerStyle = Handlebars.compile(headerStyleFile);
      Handlebars.registerPartial('headerStyle', `<style>${headerStyle()}</style>`);

      const headerPath = path.resolve(templateFolderPath, 'header.html');
      const headerHtml = await ReadFile(headerPath, 'utf8');
      const compiledPartial = Handlebars.compile(headerHtml);

      const headquarter = await Headquarter.findOne({ attributes: ['companyName', 'companyRegistrationNo'] });
      if (!user && userId) {
        const employee = await Employees.findOne({ where: { id: userId }, attributes: ['name'] });
        if (employee) user = employee.name;
      }

      const data = {
        ...param,
        companyName: headquarter.companyName,
        companyRegistrationNo: headquarter.companyRegistrationNo,
        date: moment().format('DD/MM/YYYY hh:mm:A'),
        user
      };

      const header = compiledPartial(data);
      Handlebars.registerPartial('header', header);
      return resolve(header);
    } catch (e) {
      return reject(e);
    }
  });

const compileFooterPartial = () =>
  new Promise(async (resolve, reject) => {
    try {
      const footerStyleFile = await ReadFile(path.resolve(templateFolderPath, 'styles/footer.scss'), 'utf8');
      const footerStyle = Handlebars.compile(footerStyleFile);
      Handlebars.registerPartial('footerStyle', `<style>${footerStyle()}</style>`);

      const filePath = path.resolve(templateFolderPath, 'footer.html');
      const html = await ReadFile(filePath, 'utf8');
      const compiled = Handlebars.compile(html);
      const footer = compiled();
      Handlebars.registerPartial('footer', footer);
      return resolve(footer);
    } catch (e) {
      return reject(e);
    }
  });

const preCompilePartials = () =>
  new Promise(async (resolve, reject) => {
    try {
      const bootstrapFile = await ReadFile(path.resolve(templateFolderPath, 'styles/bootstrap-utilities.css'), 'utf8');
      const commonFile = await ReadFile(path.resolve(templateFolderPath, 'styles/common.css'), 'utf8');
      const bootstrapStyle = Handlebars.compile(bootstrapFile);
      const commonStyle = Handlebars.compile(commonFile);

      Handlebars.registerPartial('bootstrapUtilities', `<style>${bootstrapStyle()}</style>`);
      Handlebars.registerPartial('commonStyle', `<style>${commonStyle()}</style>`);
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

preCompilePartials();
