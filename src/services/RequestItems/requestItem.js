import { getAllRequestedProduct, getSingleProduct, requestProduct, updateProduct } from './requestItem.entity';

export default function RequestItem() {

  /**
   * POST /user
   * @description This route is used to add a product request.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.post('/request-product', requestProduct(this));
  /**
   * POST /user
   * @description This route is used to get all requested product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/request-product', getAllRequestedProduct(this));
  /**
  * POST /request-product/sendinvoice
  * @description This route is used to add a product request.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.post('/request-product/sendinvoice', sendInvoice(this));
  /**
   * POST /user
   * @description This route is used to get all requested product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/request-product/:id', getSingleProduct(this));
  /**
   * POST /user
   * @description This route is used to get all requested product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.patch('/request-product/:id', updateProduct(this));
}