import { Admins } from '@models';
import { USER_TYPE } from '@constants';
import { hashPassword } from '@tools/bcrypt';
import { requestValidator } from '@validators';

export const create = async (req, res, next) => {
  try {
    requestValidator(req);
    const { email, password, confirmPassword, username } = req.body;

    const existingAdminByEmail = await Admins.findOne({ where: { email } });
    if (existingAdminByEmail)
      throw new Error('Email not available. Please register with another email.');

    const existingAdminByUsername = await Admins.findOne({ where: { username } });
    if (existingAdminByUsername) {
      throw new Error('Username not available. Please register with another username.');
    }

    if (password !== confirmPassword)
      throw new Error('Confirmation Password is incorrect, please try again.');

    const admin = await Admins.create({ ...req.body });

    const payload = Object.assign(admin.dataValues, { type: USER_TYPE.ADMIN });
    delete payload.password;

    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    return next(e);
  }
};

export const adminChangePassword = async (req, res, next) => {
  try {
    requestValidator(req);

    const { id } = req.user;

    const { password, confirmPassword, currentPassword } = req.body;

    const admin = await Admins.unscoped().findOne({
      where: { id }
    });

    const validPassword = await admin.comparePassword(currentPassword);
    if (!validPassword) {
      throw new Error('Password is incorrect, please try again...');
    }
    if (password !== confirmPassword) {
      throw new Error('Confirmation Password does not match with password.');
    }

    admin.update({
      password: hashPassword(password)
    });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};
