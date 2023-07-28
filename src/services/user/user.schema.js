import mongoose, { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, },
    phone: { type: String, default:null },
    role: { type: String, enum: ['super-admin', 'admin', 'support', 'user'], default: 'user' },
    access: {
      type: [{
        type: String,
        enum: ['order', 'request', 'support', 'product']
      }],
      default: []
    },
    avatar: { type: String },
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        quantity: { type: Number, default: 1 },
      },
    ],
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      area: { type: String },
      zip: { type: String },
    },
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

export default model('User', schema);