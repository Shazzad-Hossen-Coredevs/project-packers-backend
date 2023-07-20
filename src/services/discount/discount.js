import { checkValidity, createDiscount, delDiscountcodes, getDiscountlist } from './discount.entity';

export default function discount() {

  /**
  * POST /discount
  * @description This route is used to create a discount code.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/discount', createDiscount(this));
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
  this.route.post('/discount-check', checkValidity(this));
  /**
  * DELETE /discoun
  * @description This route is used to create a discount code.
  * @response {Object} 200 - the new user.
  */
  this.route.delete('/discount', delDiscountcodes(this));
}