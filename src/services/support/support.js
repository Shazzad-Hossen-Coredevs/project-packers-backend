import { auth } from '../middlewares';
import { acceptChat, addMsg, createChat, getAll, getOne, joinRoom, leaveRoom } from './support.entity';

export default function support() {

  /**
  * GET /support
  * @description This route is used to create a new suport chat.
  * @response {Object} 200 - the new user.
  */
  this.route.get('/support', auth, getAll(this));
  /**
* GET /support/:id
* @description This route is used to create a new suport chat.
* @response {Object} 200 - the new user.
*/
  this.route.get('/support/:id', auth, getOne(this));
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
  this.route.patch('/support', auth, addMsg(this));


}
export const supportSocket = (app) => {
  app.register('joinRoom', joinRoom);
  app.register('leaveRoom', leaveRoom);

};