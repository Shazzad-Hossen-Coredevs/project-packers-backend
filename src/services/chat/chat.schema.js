import mongoose, { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {

    support: { type: mongoose.Schema.Types.ObjectId, ref: 'Support' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    date: { type: Date, default: new Date() }

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

export default model('Chat', schema);