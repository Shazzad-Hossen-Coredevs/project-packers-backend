import { auth, checkRole } from '../middlewares';
import { addOrder, cancelPayment, deleteOrder, failPayment, getOrders, ipnPayment, myOrder, singleOrder, successPayment, updateOrderstatus, userOrder } from './order.entity';

export default function order() {
  /**
   * POST /order
   * @description This route is used to create a order.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.post('/order', auth, addOrder(this));
  /**
   * GET /order
   * @description This route is used to get all  order details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/order', auth, checkRole(['admin','super-admin']), getOrders(this));
  /**
   * GET /a user order
   * @description This route is used to get all order of a specific user.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/order/user/:id',auth, userOrder(this));
  /**
   * GET /myorder
   * @description This route is used to get a single order details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/order/:id',auth, singleOrder(this));
  /**
   * PATCH /order
   * @description This route is used to change a order status.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.patch('/order', auth, updateOrderstatus(this));
  /**
   * DELETE /order/:id
   * @description This route is used to delete a order details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.delete('/order/:id', auth, deleteOrder(this));
  /**
   * GET /myorder
   * @description This route is used to get own orders list.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/myorder', auth, myOrder(this));
  /**
  * POST /order/payment/success
  * @description This route is used for successfull payment.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/order/payment/success/:id', successPayment(this));
  /**
  * POST /order/payment/fail
  * @description This route is used  if payment is failed.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/order/payment/fail/:id', failPayment(this));
  /**
  * POST /order/payment/cancel
  * @description This route is used if payment is cancelled
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/order/payment/cancel/:id', cancelPayment(this));
  /**
  * POST /order/payment/fail
  * @description This route is not completed.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/order/payment/ipn', ipnPayment(this));


}