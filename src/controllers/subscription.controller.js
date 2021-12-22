import { Subscriptions, Packages, Users, Countries } from '@models';
import { requestValidator } from '@validators';
import Billplz from '@services/billplz.service';
import { getCountryId } from '@utils/index';
import { COUNTRIES } from '@constants/countries.constant';
import { getBeepPayPaymentUrl } from '@services/pay-beep.service';

export const subscribe = async (req, res, next) => {
  try {
    requestValidator(req);

    const { id } = req.user;
    const { packageId } = req.body;

    const countryId = await getCountryId(req);

    const country = await Countries.findOne({ where: { id: countryId } });

    const pkg = await Packages.scope([{ method: ['byCountry', countryId] }]).findOne({
      where: { id: packageId }
    });

    if (!pkg) {
      throw new Error('Invalid packageId given,, package not found');
    }

    const user = await Users.findOne({ where: { id } });

    if (country.code === COUNTRIES.MALAYSIA.CODE) {
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
    }

    if (country.code === COUNTRIES.BRUNEI.CODE) {
      const url = await getBeepPayPaymentUrl(pkg.price, `u${user.id}-p${pkg.id}`);

      return res
        .status(200)
        .json({ message: 'success', payload: { url, description: `Subscribing ${pkg.title}` } });
    }
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
