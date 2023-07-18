import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    name: { type: String, required: true },
    whereToBuy: { type: String, required: true },
    quantity: { type: String, required: true },
    notes: { type: String },
    thumbnails: { type: Array, required: true },
    status:{ type: String, required:true}

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