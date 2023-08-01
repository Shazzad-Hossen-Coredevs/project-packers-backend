import passport from 'passport';
import { auth, checkRole } from '../middlewares';
import { passportAuth } from './passport.config';
import { addStaff, addTocart, chatwithUser, generateOtp, getAll, login, logout, me, register, remove, resetPassword, socialData, updateCart, updateOwn, updateStaff, updateUser, userProfile, verifyOtp } from './user.entity';

export default function user() {
  passportAuth(this);


  /**
  * POST /user
  * @description This route is used to create a user.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/user', register(this));
  /**
  * POST /user
  * @description This route is used to generate otp.
  * @response {Object} 200 -token.
  */
  this.route.post('/user/otp', generateOtp(this));
  /**
  * POST /user
  * @description This route is used to verify otp.
  * @response {Object} 200 -token.
  */
  this.route.post('/user/otp-verify', verifyOtp(this));
  /**
  * POST /user/otp
  * @description This route is used to reset password.
  * @response {Object} 200 - Acknowledgement.
  */
  this.route.post('/user/resetpass', resetPassword(this));

  /**
  * POST /user/login
  * @description this route is used to login a user.
  * @response {Object} 200 - the user.
  */
  this.route.post('/user/login', login(this));

  /**
  * GET /user/me
  * @description this route is used to get user profile.
  * @response {Object} 200 - the user.
  */
  this.route.get('/user/me', auth, me(this));

  /**
  * POST /user/logout
  * @description this route is used to logout a user.
  * @response {Object} 200 - the user.
  */
  this.route.post('/user/logout', auth, logout(this));

  /**
  * GET /user
  * @description this route is used to used get all user.
  * @response {Object} 200 - the users.
  */
  this.route.get('/user', auth, getAll(this));

  /**
  * GET user/profile/:id
  * @description this route is used to get a user profile by id.
  * @response {Object} 200 - the user.
  */
  this.route.get('/user/profile/:id', auth, userProfile(this));

  /**
  * PATCH ‘/user/me’
  * @description this route is used to update own profile.
  * @response {Object} 200 - the user.
  */
  this.route.patch('/user/me', auth, updateOwn(this));
  /**
* PATCH ‘/user/cart'’
* @description this route is used to add item to cart.
* @response {Object} 200 - the user.
*/this.route.patch('/user/cart', auth, updateCart(this));
  /**
  * PATCH /user/staff
  * @description This route is used to create a staff.
  * @response {Object} 200 - the new user.
  */
  this.route.patch('/user/staff', auth,checkRole(['admin','super-admin']), updateStaff(this));

  /**
  * PATCH ‘/user/:id’
  * @description this route is used to update user profile.
  * @response {Object} 200 - the user.
  */
  this.route.patch('/user/:id', auth, checkRole(['admin']), updateUser(this));

  /**
* DELETE ‘/user/:id’
* @description this route is used to delte user profile.
* @response {Object} 200 - the user.
*/
  this.route.delete('/user/:id', auth, checkRole(['admin', 'super-admin']), remove(this));
  /**
* POST ‘/user/cart'’
* @description this route is used to add item to cart.
* @response {Object} 200 - the user.
*/this.route.post('/user/cart', auth, addTocart(this));
  /**
  * POST /user/staff
  * @description This route is used to create a staff.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/user/staff', auth, checkRole(['super-admin', 'admin']), addStaff(this));

  /**
 * GET /user/google
 * @description This route is used to login using google.
 * @response {Object} 200 - the new user.
 */
  this.route.get('/user/google', passport.authenticate('google'));
  /**
 * GET /user/google/callback
 * @description This route is for google callback url.
 * @response {Object} 200 - the new user.
 */
  this.route.get('/user/google/callback', passport.authenticate('google', {
    successRedirect: 'http://localhost:5173/success',
    failureRedirect: 'http://localhost:5173/failed'
  }));
  /**
* GET /user/facebook
* @description This route is used to login using facebook.
* @response {Object} 200 - the new user.
*/
  this.route.get('/user/facebook', passport.authenticate('facebook'));
  /**
 * GET /user/facebook/callback
 * @description This route is for google callback url.
 * @response {Object} 200 - the new user.
 */
  this.route.get('/user/facebook/callback', passport.authenticate('facebook', {
    successRedirect: 'http://localhost:5173/success',
    failureRedirect: 'http://localhost:5173/failed'
  }));
  /**
  * GET /user/social
  * @description This route is used to fatch socail login data.
  * @response {Object} 200 - the new user.
  */
  this.route.get('/user/social', socialData(this));





}

export const supportChat = (app) => {
  //app.register('eventname', chatwithUser);


};