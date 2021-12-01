import { createDeliveryTask } from '@services/tookan.service';
import { generateOrder } from '@services/pay-beep.service';

export const test = async (req, res, next) => {
  try {
    // const response = await createDeliveryTask({
    //   buyerName: 'John Doe',
    //   buyerAddress: '90 Lot 5047 Kg Sg Liang, Belait',
    //   buyerPhoneNo: '0123456789',
    //   deliveryDateTime: '2021/12/31 18:00:00',
    //   description: 'TEST ONLY',
    //   orderId: 1,
    //   pickupDateTime: '2021/12/20 10:00:00',
    //   sellerAddress: '90 Lot 5047 Kg Sg Liang, Belait',
    //   sellerPhoneNo: '0123456789',
    //   sellerName: 'John Doe_2'
    // });

    // console.log(`response`, response.data);

    const response = await generateOrder({ orderId: 2, orderAmount: 10.0 });
    console.log(`response`, response);

    return res.status(404).json({
      message: 'Not Found'
    });
  } catch (e) {
    return next(e);
  }
};
