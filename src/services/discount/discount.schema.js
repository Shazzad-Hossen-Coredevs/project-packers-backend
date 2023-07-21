import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    limit: { type: Number, required: true },
    expiresIn: { type: Date, required: true },
    user: { type: Array}
  },
  { timestamps: true }
);

schema.plugin(paginate);
schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return JSON.parse(JSON.stringify(obj));
};

export default model('discount', schema);
