import mongoose, { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    status: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        quantity: { type: Number, required: true },
      },
    ],
    code: { type: String },
    contact: {
      email: { type: String, required: true },
      phone: {
        primary: { type: String, required: true },
        alt: { type: String },
      },
    },
    shippingAddress: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      area: { type: String, required: true },
      zip: { type: String, required: true },
      dlInstruction: { type: String },
    },
    shipping: { type: String, required: true },
    shippingAmount: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    estimatedTotal: { type: Number, required: true },
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

export default model('order', schema);
