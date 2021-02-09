import { Conditions } from '@models';

import { CONDITION } from '@constants';

module.exports = {
  up: async () => {
    const conditions = await Conditions.findAll();
    await Promise.all(
      conditions.map(async cond => {
        switch (cond.title) {
          case CONDITION.NEW_WITH_TAGS:
            await cond.update({ description: 'Never worn, tags still intact' });
            break;

          case CONDITION.NEW_WITHOUT_TAGS:
            await cond.update({ description: 'Never worn, no tag' });
            break;

          case CONDITION.VERY_GOOD:
            await cond.update({ description: 'Worn, still looks great' });
            break;

          case CONDITION.GOOD:
            await cond.update({ description: 'Few visible flaws, explained in the description' });
            break;

          case CONDITION.ACCEPTABLE:
            await cond.update({
              description: 'Some very visible flaws, explained in the description'
            });
            break;

          default:
        }
      })
    );

    return Promise.resolve();
  },

  down: () => Promise.resolve()
};
