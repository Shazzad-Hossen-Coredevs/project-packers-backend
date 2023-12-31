import mongoose, { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum:['pending', 'active', 'archived', 'draft'], default: 'pending' },
    stock: { type: Number, required: true },
    thumbnails: { type: Array, required: true },
    desc: { type: String, default:'On request' },
    price: { type: Number, required: true },
    link: { type: String, required: true },
    from: { type: String, required: true },
    whereToBuy: { type: String, required: true },
    deliveryTime: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    tax: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subCategory: { type: String, required: true },
    tags: { type: String },
    publishDate: { type: Date, default: new Date()}
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
