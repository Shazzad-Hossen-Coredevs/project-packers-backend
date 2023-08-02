import mongoose, { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    status: { type: String, enum: ['pending', 'initiated', 'completed', 'canceled'], default: 'pending' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'order', required: true , unique: true },
    reason: { type: String, required: true },
    refunded: { type: Boolean, default: false }
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

export default model('refund', schema);
