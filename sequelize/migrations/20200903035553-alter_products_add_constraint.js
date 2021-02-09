import { db } from '@configs/sequelize-connector.config';

module.exports = {
  up: async () => {
    await db.query('ALTER TABLE products ADD FULLTEXT(title);');
    await db.query('ALTER TABLE products ADD FULLTEXT(description);');
    await db.query('ALTER TABLE products ADD FULLTEXT(title, description);');
    return Promise.resolve();
  },

  down: () => Promise.resolve()
};
