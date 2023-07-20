import { addCategory, addSubcategory, deleteSubcategory, deletecategory, getCategories } from './category.entity';

export default function category() {

  /**
  * POST /category
  * @description This route is used to create a new category.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/category', addCategory(this));
  /**
  * POST /category
  * @description This route is used to get all category.
  * @response {Object} 200 - the new user.
  */
  this.route.get('/category', getCategories(this));
  /**
  * POST /category
  * @description This route is used to get all category.
  * @response {Object} 200 - the new user.
  */
  this.route.delete('/category/:id', deletecategory(this));
  /**
  * POST /category
  * @description This route is used to add new sub-categories.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/category-sub', addSubcategory(this));
  /**
  * POST /category
  * @description This route is used to add new sub-categories.
  * @response {Object} 200 - the new user.
  */
  this.route.delete('/category-sub/:id', deleteSubcategory(this));
}