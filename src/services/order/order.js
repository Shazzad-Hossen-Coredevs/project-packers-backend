import { auth } from '../middlewares';
import { addOrder, getOrders } from './order.entity';

export default function order() {
  /**
   * POST /order
   * @description This route is used to create a order.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.post('/order', auth, addOrder(this));
  /**
   * POST /order
   * @description This route is used to get all  order details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/order',auth, getOrders(this));
}