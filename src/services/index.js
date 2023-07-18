import RequestItem from './RequestItems/requestItem';
import demo from './demo/demo';
import product from './product/product';
import user from './user/user';
export const services = (app) => {
  app.configure(demo);
  app.configure(user);
  app.configure(product);
  app.configure(RequestItem);

};
