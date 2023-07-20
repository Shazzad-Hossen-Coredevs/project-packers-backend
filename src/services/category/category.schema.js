import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type:String,required:true},
    subCategory: { type: Array },
  },
  { timestamps: true }
);

schema.plugin(paginate);
schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

export default model('Category', schema);