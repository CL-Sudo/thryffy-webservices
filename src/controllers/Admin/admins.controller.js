import { Admins } from '@models';
import { USER_TYPE } from '@constants';
import { hashPassword } from '@tools/bcrypt';
import { requestValidator } from '@validators';
import ADMIN_ROLE from '@constants/admin.constant';
import R from 'ramda';

export const create = async (req, res, next) => {
  try {
    requestValidator(req);
    const { email, password, username } = req.body;

    const existingAdminByEmail = await Admins.findOne({ where: { email } });
    if (existingAdminByEmail)
      throw new Error('Email not available. Please register with another email.');

    const existingAdminByUsername = await Admins.findOne({ where: { username } });
    if (existingAdminByUsername) {
      throw new Error('Username not available. Please register with another username.');
    }

    if (!password) throw new Error('Password is required.');

    const admin = await Admins.create({ ...req.body, role: ADMIN_ROLE.OPERATOR });

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

export const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { id: adminId } = req.params;

    const superadmin = await Admins.findOne({ where: { id } });

    if (superadmin.role !== ADMIN_ROLE.SUPER_ADMIN) {
      throw new Error('Only Super Admins are allowed to do this operation.');
    }

    const { email, username, password = null } = req.body;

    if (!R.isNil(password) && password.length < 4)
      throw new Error('Must contain at least 4 characters');

    const admin = await Admins.findOne({ where: { id: adminId } });
    if (!admin) throw new Error('Invalid adminId given');

    const currentEmail = admin.email;
    const currentUsername = admin.username;

    if (email !== currentEmail) {
      const adminByEmail = await Admins.findOne({ where: { email } });
      if (adminByEmail && adminByEmail.id !== id) throw new Error('Email is not available.');
    }

    if (username !== currentUsername) {
      const adminByUsername = await Admins.findOne({ where: { username } });
      if (adminByUsername && adminByUsername.id !== id)
        throw new Error('Username is not available.');
    }

    const updateObj = password
      ? { email, username, password: hashPassword(password), updatedBy: id }
      : { email, username, updatedBy: id };

    await admin.update(updateObj);
    await admin.reload();

    return res.status(200).json({ message: 'success', payload: admin });
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
