import { auth } from '../middlewares';
import { createChat } from './support.entity';

export default function support() {

  /**
  * POST /support
  * @description This route is used to create a new suport chat.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/support',auth, createChat(this));


}