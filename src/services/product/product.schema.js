import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum:['pending', 'active', 'archived', 'draft'], default: 'pending' },
    stock: { type: Number, required: true },
    thumbnails: { type: Array, required: true },
    desc: { type: String, required: true },
    price: { type: Number, required: true },
    actualPrice: { type: Number, required: true },
    productLink: { type: String, required: true },
    from: { type: String, required: true },
    whereToBuy: { type: String, required: true },
    develeryTime: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    tax: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
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

export default model('product', schema);
