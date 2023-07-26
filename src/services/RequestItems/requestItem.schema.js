import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    name: { type: String, required: true },
    link: { type: String, required: true },
    user: { type: String, required: true },
    price: { type: Number },
    quantity: { type: String, required: true },
    notes: { type: String },
    thumbnails: { type: Array, required: true },
    status: { type: String, enum: ['pending', 'estimate-sent', 'closed', 'abandoned', 'accepted'], default: 'pending' },
    invoice:{ type: Boolean, default: false },
    stock: { type: Number },
    tax: { type: Number},
    fee: { type: Number}
  },
  { timestamps: true }
);

schema.plugin(paginate);
schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.password;
  delete obj.notifySubs;
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

export default model('RequestItem', schema);