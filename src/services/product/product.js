import { addProduct, deleteProduct, getProducts, getSingleProduct, updateProduct } from './product.entity';

export default function product() {
  /**
   * POST /product
   * @description This route is used to create a product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.post('/product', addProduct(this));
  /**
   * GET /product
   * @description This route is used to fetch all products.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/product', getProducts(this));
  /**
   * GET /product/:id
   * @description This route is used to get a single product details.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/product/:id', getSingleProduct(this));
  /**
   * PATCH /product/:id
   * @description This route is used to update a product info.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.patch('/product/:id', updateProduct(this));
  /**
   * POST /product/:id
   * @description This route is used to delete a product.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.delete('/product/:id', deleteProduct(this));

}