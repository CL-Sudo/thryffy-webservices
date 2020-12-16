import { Subscriptions, Packages, Users } from '@models';
import { requestValidator } from '@validators';
import Billplz from '@services/billplz.service';

export const subscribe = async (req, res, next) => {
  try {
    requestValidator(req);

    const { id } = req.user;
    const { packageId } = req.body;

    const pkg = await Packages.findOne({ where: { id: packageId } });
    const user = await Users.findOne({ where: { id } });

    const billplz = new Billplz();
    const response = await billplz.createBill({
      amount: pkg.price,
      callbackUrl: `${process.env.NGROK_URL}/api/publics/subscriptions/callback?userId=${id}&packageId=${packageId}`,
      email: user.email,
      mobile: user.completePhoneNumber,
      name: user.fullName,
      itemName: `Package ${pkg.title}`,
      redirectUrl: 'www.google.com'
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
