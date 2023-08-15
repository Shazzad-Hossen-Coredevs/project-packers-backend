import { auth } from '../middlewares';
import { getChats, sendMessage } from './chat.entity';


export default function chat() {

  /**
  * POST /chat
  * @description This route is used to get all chats of a specific support.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/chat', auth, sendMessage(this));

  /**
  * GET /chat/:id
  * @description This route is used to get all chats of a specific support.
  * @response {Object} 200 - the new user.
  */
  this.route.get('/chat/:id', auth, getChats(this));



}
