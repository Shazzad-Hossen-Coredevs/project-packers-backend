import mongoose, { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema(
  {
    type: { type: String, enum: ['refund', 'order', 'account', 'payment'] },
    order: { type: String },
    status: { type: String, enum: ['pending', 'open', 'closed'], default: 'pending' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    chats: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        date: { type: Date, default: new Date()}
      }

    ]


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

export default model('Support', schema);