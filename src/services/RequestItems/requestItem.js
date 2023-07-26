import { auth } from '../middlewares';
import { getAllRequestedProduct, getSingleProduct, invoiceResponse, requestProduct, sendInvoice, updateProduct } from './requestItem.entity';

export default function RequestItem() {

  /**
   * POST /request-product
   * @description This route is used to add a product request.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.post('/request-product', auth, requestProduct(this));
  /**
   * GET /request-product
   * @description This route is used to get all requested product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/request-product', getAllRequestedProduct(this));
  /**
  * POST /request-product/invoice
  * @description This route is used to send invoice to mail.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/request-product/invoice', sendInvoice(this));
  /**
  * GET /request-product/invoice/:token
  * @description This route is used to add a receive invoice response.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.get('/request-product/invoice/:token', invoiceResponse(this));
  /**
   * GET /request-product/:id'
   * @description This route is used to get all requested product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/request-product/:id', getSingleProduct(this));
  /**
   * PATCH /request-product/:id
   * @description This route is used to get all requested product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.patch('/request-product/:id', updateProduct(this));
}