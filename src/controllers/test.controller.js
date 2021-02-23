import R from 'ramda';
import { isJSON } from '@utils';

const parseImagesToPersist = fields => {
  const parseFromJSON = arr => R.map(R.ifElse(isJSON, param => JSON.parse(param), R.identity))(arr);

  const result = R.pipe(
    R.without([1]),
    parseFromJSON
  )(
    Object.keys(fields).map(key => {
      if (isJSON(fields[key]) && key.substr(0, 5) === 'image') {
        const indexString = `, "index": ${key.substr(6, 1)}}`;
        return fields[key].replace('}', indexString);
      }
      if (!isJSON(fields[key]) && key.substr(0, 5) === 'image') {
        return { id: fields[key].id, index: Number(key.substr(6, 1)) };
      }
      return 1;
    })
  );
  return result;
};

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    return res.status(200).json({
      message: 'not found'
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
