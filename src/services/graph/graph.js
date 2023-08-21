import { auth } from '../middlewares';
import { dashBoardData, getGraphdata, getHeatmap, overviewData } from './graph.entity';


export default function gaph() {
  /**
   * GET /graph/chart
   * @description This route is used to get linear chart data.
   * @request {Object} -product details object.
   * @response {oblect} - acknowledgement true.
   */
  this.route.get('/graph/chart', auth, getGraphdata(this));
  /**
  * GET /graph/heatmap
  * @description This route is used to get heatmap data.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.get('/graph/heatmap', auth, getHeatmap(this));
  /**
  * GET /graph/heatmap
  * @description This route is used to dashboard overview data.
  * @request {Object} -product details object.
  * @response {oblect} - acknowledgement true.
  */
  this.route.get('/graph/overview',auth, overviewData(this));
  /**
 * GET /graph/heatmap
 * @description This route is used to get all overview, chart and heatmap data.
 * @request {Object} -product details object.
 * @response {oblect} - acknowledgement true.
 */
  this.route.get('/graph', auth, dashBoardData(this));
}