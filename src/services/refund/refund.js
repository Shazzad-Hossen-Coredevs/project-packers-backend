import { initiateRefund, refundList, refundReq, updateRefund } from './refund.entity';

export default function refund() {

  /**
  * POST /refund
  * @description This route is used to create a user.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/refund', refundReq(this));
  /**
  * GET /refund
  * @description This route is used to create a user.
  * @response {Object} 200 - the new user.
  */
  this.route.get('/refund', refundList(this));
  /**
  * Patch /refund/
  * @description This route is used to create a user.
  * @response {Object} 200 - the new user.
  */
  this.route.patch('/refund', updateRefund(this));
  /**
  * POST /refund/:refundID
  * @description This route is used to create a user.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/refund/:refundID', initiateRefund(this));
}