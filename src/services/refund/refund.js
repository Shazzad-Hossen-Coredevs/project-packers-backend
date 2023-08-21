import { initiateRefund, refundList, refundReq, updateRefund } from './refund.entity';

export default function refund() {

  /**
  * POST /refund
  * @description This route is used to create a refund request.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/refund', refundReq(this));
  /**
  * GET /refund
  * @description This route is used to get refund request list.
  * @response {Object} 200 - the new user.
  */
  this.route.get('/refund', refundList(this));
  /**
  * Patch /refund/
  * @description This route is used to update refund status.
  * @response {Object} 200 - the new user.
  */
  this.route.patch('/refund', updateRefund(this));
  /**
  * POST /refund/:refundID
  * @description This route is used to give refund to the user.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/refund/:refundID', initiateRefund(this));
}