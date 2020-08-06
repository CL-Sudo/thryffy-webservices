import _ from 'lodash';

export default (prefix, id) => prefix + _.padStart(id, 8, '0');
