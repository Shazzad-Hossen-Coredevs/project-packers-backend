import { serveImage } from './image.entity';

export default function Image() {
  /**
   * GET /image
   * @description This route is used to serve an image.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/images/:id', serveImage(this));

}