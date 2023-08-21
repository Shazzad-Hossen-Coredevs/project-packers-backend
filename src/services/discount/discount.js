import { auth, checkRole } from '../middlewares';
import { checkValidity, createDiscount, delDiscountcodes, getDiscountlist } from './discount.entity';

export default function discount() {

  /**
  * POST /discount
  * @description This route is used to create a discount code.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/discount', auth, checkRole(['admin','super-admin']), createDiscount(this));
  /**
  * GET /discount
  * @description This route is used to get list of all discount code.
  * @response {Object} 200 - the new user.
  */
  this.route.get('/discount', getDiscountlist(this));
  /**
  * POST /discount-check
  * @description This route is used to check validity of a discount code.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/discount-check', auth,  checkValidity(this));
  /**
  * DELETE /discoun
  * @description This route is used to delete a discount code.
  * @response {Object} 200 - the new user.
  */
  this.route.delete('/discount', auth, checkRole(['admin', 'super-admin']), delDiscountcodes(this));
}