import * as _ from 'lodash';
import { uploadToS3 } from '@tools/s3';
import { parsePathForDBStoring } from '@utils/s3.util';
import mime from 'mime-types';
// import * as fs from 'fs';

// export const uploadFiles = async (files = [], keys = []) => {
//   try {
//     const operations = [];
//     const result = {};

//     keys.forEach(key => {
//       _.set(result, key, []);
//     });

//     keys.forEach(key => {
//       files[key].forEach(file => {
//         operations.push(
//           new Promise(async (resolve, reject) => {
//             try {
//               const uploaded = await uploadToS3(
//                 'files',
//                 file.buffer,
//                 `.${mime.extension(file.mimetype)}`
//               );
//               result[key].push({
//                 path: parsePathForDBStoring(uploaded.path)
//               });
//               // fs.unlink(uploaded.path, () => {});
//               return resolve();
//             } catch (e) {
//               return reject(e);
//             }
//           })
//         );
//       });
//     });

//     await Promise.all(operations);

//     return Promise.resolve(result);
//   } catch (e) {
//     return Promise.reject(e);
//   }
// };

const parseFieldName = (fieldName, key) => {
  const realFieldName = fieldName.substr(0, _.size(key));
  return realFieldName;
};

const parseIndex = (fieldName, key) => {
  const index = Number(fieldName.replace(`${key}[`, '').replace(']', ''));
  return index || 0;
};

export const uploadFiles = async (files = [], keys = []) => {
  try {
    const operations = [];
    const result = {};

    keys.forEach(key => {
      _.set(result, key, []);
    });

    keys.forEach(key => {
      files.forEach(file => {
        operations.push(
          new Promise(async (resolve, reject) => {
            try {
              if (key === parseFieldName(file.fieldname, key)) {
                const uploaded = await uploadToS3(
                  'files/',
                  file.buffer,
                  `.${mime.extension(file.mimetype)}`
                );

                result[key].push({
                  path: parsePathForDBStoring(uploaded.path),
                  index: parseIndex(file.fieldname, key)
                });
              }

              return resolve();
            } catch (e) {
              return reject(e);
            }
          })
        );
      });
    });

    await Promise.all(operations);
    return Promise.resolve(result);
  } catch (e) {
    return Promise.reject(e);
  }
};
