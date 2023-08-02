import { auth } from '../middlewares';
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
  this.route.get('/order', auth, getOrders(this));
  /**
   * GET /a user order
   * @description This route is used to get all  order details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/order/user/:id',auth, userOrder(this));
  /**
   * GET /myorder
   * @description This route is used to get all  order details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/order/:id',auth, singleOrder(this));
  /**
   * PATCH /order
   * @description This route is used to get all  order details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.patch('/order', auth, updateOrderstatus(this));
  /**
   * DELETE /order/:id
   * @description This route is used to get all  order details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.delete('/order/:id', auth, deleteOrder(this));
  /**
   * GET /myorder
   * @description This route is used to get all  order details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/myorder', auth, myOrder(this));
  /**
  * POST /order/payment/success
  * @description This route is used to get all  order details.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/order/payment/success/:id', successPayment(this));
  /**
  * POST /order/payment/fail
  * @description This route is used to get all  order details.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/order/payment/fail/:id', failPayment(this));
  /**
  * POST /order/payment/cancel
  * @description This route is used to get all  order details.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/order/payment/cancel/:id', cancelPayment(this));
  /**
  * POST /order/payment/fail
  * @description This route is used to get all  order details.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/order/payment/ipn', ipnPayment(this));
  

}