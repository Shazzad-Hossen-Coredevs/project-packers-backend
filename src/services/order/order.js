import { auth } from '../middlewares';
import { addOrder } from './order.entity';

export default function order() {
  /**
   * POST /order
   * @description This route is used to create a order.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.post('/order',auth, addOrder(this));
}