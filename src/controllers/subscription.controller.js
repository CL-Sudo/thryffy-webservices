import { Subscriptions, Packages, Users } from '@models';
import { requestValidator } from '@validators';
import Billplz from '@services/billplz.service';

export const subscribe = async (req, res, next) => {
  try {
    requestValidator(req);

    const { id } = req.user;
    const { packageId } = req.body;

    const pkg = await Packages.scope([{ method: ['byCountry', req.user.countryId] }]).findOne({
      where: { id: packageId }
    });
    const user = await Users.findOne({ where: { id } });

    const { NODE_ENV, SERVER_URL, NGROK_URL } = process.env;
    const serverUrl = NODE_ENV === 'DEV' ? NGROK_URL : SERVER_URL;

    const billplz = new Billplz();
    const response = await billplz.createBill({
      amount: pkg.price,
      callbackUrl: `${serverUrl}/api/publics/subscriptions/callback?userId=${id}&packageId=${packageId}`,
      email: user.email,
      mobile: user.completePhoneNumber,
      name: user.fullName || user.username || user.email,
      itemName: `Package ${pkg.title}`,
      redirectUrl: `${serverUrl}/api/publics/subscriptions/redirect?userId=${id}`
    });

    return res.status(200).json({ message: 'success', payload: response.data });
  } catch (e) {
    return next(e);
  }
};

export const get = async (req, res, next) => {
  try {
    const { id } = req.user;
    const subscription = await Subscriptions.findOne({
      where: { userId: id },
      include: [
        {
          model: Packages,
          as: 'package'
        }
      ]
    });
    return res.status(200).json({ message: 'success', payload: subscription });
  } catch (e) {
    return next(e);
  }
};
