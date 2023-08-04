import { getGraphdata, getHeatmap, overviewData } from './graph.entity';


export default function gaph() {
  /**
   * GET /graph/chart
   * @description This route is used to create a order.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/graph/chart', getGraphdata(this));
  /**
  * GET /graph/heatmap
  * @description This route is used to create a order.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.get('/graph/heatmap', getHeatmap(this));
  /**
  * GET /graph/heatmap
  * @description This route is used to create a order.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.get('/graph/overview', overviewData(this));
}