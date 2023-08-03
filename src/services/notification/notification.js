import { auth } from '../middlewares';
import { myNotification } from './notification.entity';

export default function notification() {
  /**
  * GET /notifications
  * @description This route is used to create a order.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.get('/notifications', auth, myNotification(this));

}