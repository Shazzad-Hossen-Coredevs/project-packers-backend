import { addCategory, addSubcategory, deleteSubcategory, deletecategory, getCategories } from './category.entity';

export default function category() {

  /**
  * POST /category
  * @description This route is used to create a new category.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/category', addCategory(this));
  /**
  * GET /category
  * @description This route is used to get all category.
  * @response {Object} 200 - the new user.
  */
  this.route.get('/category', getCategories(this));
  /**
  * DELETE /category/:id
  * @description This route is used to delete a specific category.
  * @response {Object} 200 - the new user.
  */
  this.route.delete('/category/:id', deletecategory(this));
  /**
  * POST /category-sub
  * @description This route is used to add new sub-categories.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/category-sub', addSubcategory(this));
  /**
  * DELETE /category-sub/:id
  * @description This route is used to delete a sub category
  * @response {Object} 200 - the new user.
  */
  this.route.delete('/category-sub/:id', deleteSubcategory(this));
}