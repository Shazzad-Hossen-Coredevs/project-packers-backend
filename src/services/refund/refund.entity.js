import Refund from './refund.schema';
import Order from '../order/order.schema';
import SSLCommerzPayment from 'sslcommerz-lts';
export const refundReq = ({ db }) => async (req, res) => {
  try {
    if (!req.body.id || !req.body.reason) return res.status(400).send('Missing order id or reason in request body');
    const refund = await db.create({ table: Refund, key: { order: req.body.id, reason: req.body.reason, populate: { path: 'order', populate: { path: 'user products.product', select: 'name email phone shippingAddress _id status stock thumbnails desc price link from whereToBuy tax fee category subCategory' } } } });
    if (!refund) return res.status(400).send('Refund request unsuccessfull');
    res.status(200).send(refund);


  } catch (error) {
    console.log(error);
    return res.status(500).send('Something wents wrong');

  }
};

export const refundList = ({ db }) => async (req, res) => {
  try {
    const refund = await db.find({ table: Refund, key: { populate: { path: 'order', populate: { path: 'user products.product', select: 'name email phone shippingAddress _id status stock thumbnails desc price link from whereToBuy tax fee category subCategory' } } } });
    if (!refund) return res.status(400).send('Something wents wrong');
    res.status(200).send(refund);

  } catch (error) {
    console.log(error);
    return res.status(500).send('Something wents wrong');

  }
};

export const updateRefund = ({ db }) => async (req, res) => {
  try {
    if (!req.body.id || !req.body.status) return res.status(400).send('Id or status missing in request body');
    const { status } = req.body;
    const refund = await db.findOne({ table: Refund, key: { id: req.body.id, populate: { path: 'order' } } });
    if (!refund) return res.status(400).send('Something wents wrong');
    const order = await db.findOne({ table: Order, key: { id: refund.order._id } });
    if (!order) return res.status(400).send('Something wents wrong');
    refund.status = status;
    order.status = status === 'processing' ? 'refundProcessing' : status === 'completed' ? 'refunded' : status === 'cancelled' ? 'refundCancelled' : order.status;
    await db.save(refund);
    await db.save(order);
    res.status(200).send(refund);

  } catch (error) {
    console.log(error);
    return res.status(500).send('Something wents wrong');

  }
};

export const initiateRefund = ({ db, settings }) => async (req, res) => {
  try {
    if (!req.params.refundID) return res.status(400).send('Missing refundID in request params');
    const refund = await db.findOne({ table: Refund, key: { id: req.params.refundID , populate: { path: 'order'}} });
    if (!refund) return res.status(400).send('Something wents wrong');
    const sslcz = new SSLCommerzPayment(settings.PAYMENT_GATEWAY.STORE_ID, settings.PAYMENT_GATEWAY.STORE_PSWD, settings.PAYMENT_GATEWAY.IS_LIVE);
    const data = {
      refund_amount: refund.order.estimatedTotal,
      refund_remarks: refund.reason,
      bank_tran_id: refund.order.paymentDetails.bank_tran_id,
      refe_id: refund.order.orderNumber,
    };
    if (!refund.refunded) {
      const refundRes = await sslcz.initiateRefund(data);
      if (!refundRes) return res.status(400).send('Something wents wrong');
      if (refundRes.status === 'success') {
        refund.refunded = true;

      }
      await db.save(refund);
      return res.status(200).send(refund)


    }
    return res.status(400).send('Refund already done for this Order.');




  } catch (error) {
    console.log(error);
    return res.status(500).send('Something wents wrong');

  }
}