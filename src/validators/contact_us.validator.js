import ENQUIRY from '@constants/enquiry.constant';
import { isEmpty, removeRepeatedWhiteSpace } from '@validators';

export const constactUsValidator = (fields, files) => {
  try {
    const { subject, type, description } = fields;
    if (isEmpty(subject)) throw new Error('subject required');
    if (isEmpty(type)) throw new Error('type required');

    if (subject.length === 0) throw new Error('subject required');

    if (
      !Object.keys(ENQUIRY)
        .map(e => ENQUIRY[e])
        .includes(type)
    ) {
      throw new Error('Invalid type given');
    }

    if (description && description.length > 250) {
      throw new Error('description cannot be more than 250.');
    }

    fields.subject = removeRepeatedWhiteSpace(subject.trim());
    fields.type = subject.trim();

    if (fields.description) {
      fields.description = removeRepeatedWhiteSpace(description.trim());
    }

    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
