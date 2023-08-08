import { auth } from '../middlewares';
import { acceptChat, createChat, joinRoom, leaveRoom } from './support.entity';

export default function support() {

  /**
  * POST /support
  * @description This route is used to create a new suport chat.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/support', auth, createChat(this));

  /**
 * POST /support/:id
 * @description This route is used to create a new suport chat.
 * @response {Object} 200 - the new user.
 */
  this.route.post('/support/:id', auth, acceptChat(this));
  /**
  * PATCH /support
  * @description This route is used to create a new suport chat.
  * @response {Object} 200 - the new user.
  */
  this.route.patch('/support', auth, createChat(this));


}
export const supportSocket = (app) => {
  app.register('joinRoom', joinRoom);
  app.register('leaveRoom', leaveRoom);

};