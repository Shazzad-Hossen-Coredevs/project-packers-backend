import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    user: { type: String, required: true },
    type: { type: String, required: true },
    msg: { type: String, required: true },
    url: { type: String, required: true }
  },
  { timestamps: true }
);

schema.plugin(paginate);
schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.updatedAt;
  return JSON.parse(JSON.stringify(obj));
};

export default model('notification', schema);
