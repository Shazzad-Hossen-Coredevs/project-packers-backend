import { demoGraph, demoMail, demoget } from './demo.entity';
import { demoMid } from './demo.middleware';

export default function demo() {
  this.route.get('/demo', demoMid, demoget(this));// don't forget to pass this.
  this.route.post('/demo');
  this.route.post('/demomail', demoMail(this));
  this.route.post('/demograph', demoGraph(this));

}

// don't forget to configure this service at service index.