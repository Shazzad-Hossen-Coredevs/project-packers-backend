import { addProduct, getProducts, getSingleProduct } from './product.entity';

export default function product() {
  /**
   * POST /user
   * @description This route is used to create a product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.post('/product', addProduct(this));
  /**
   * POST /user
   * @description This route is used to create a product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/product', getProducts(this));
  /**
   * POST /user
   * @description This route is used to create a product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/product/:id', getSingleProduct(this));
}