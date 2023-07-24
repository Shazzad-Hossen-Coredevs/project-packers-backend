import { auth } from '../middlewares';
import { addOrder, deleteOrder, getOrders, myOrder, singleOrder, updateOrderstatus } from './order.entity';

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
  this.route.get('/myorder',auth, myOrder(this));

}