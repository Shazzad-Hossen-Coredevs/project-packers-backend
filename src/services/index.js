import RequestItem from './RequestItems/requestItem';
import category from './category/category';
import demo from './demo/demo';
import discount from './discount/discount';
import Image from './image/image';
import order from './order/order';
import product from './product/product';
import support, { supportSocket } from './support/support';
import user from './user/user';
import graph from './graph/graph';
import refund from './refund/refund';
import notification from './notification/notification';
import chat from './chat/chat';
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
  app.configure(refund);
  app.configure(notification);
  app.configure(chat);
  supportSocket(app);


};
