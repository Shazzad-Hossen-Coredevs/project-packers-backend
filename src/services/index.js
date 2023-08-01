import RequestItem from './RequestItems/requestItem';
import category from './category/category';
import demo from './demo/demo';
import discount from './discount/discount';
import Image from './image/image';
import order from './order/order';
import product from './product/product';
import support from './support/support';
import user, { supportChat } from './user/user';
import graph from './graph/graph';
export const services = (app) => {
  app.configure(demo);
  app.configure(user);
  app.configure(product);
  app.configure(RequestItem);
  app.configure(category);
  app.configure(discount);
  app.configure(order);
  app.configure(Image);
  app.configure(support);
  app.configure(graph);
  supportChat(app);

};
