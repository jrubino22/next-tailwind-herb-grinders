import mongoose from 'mongoose';

const SubProductSchema = new mongoose.Schema(
  {
    variant: { type: String, required: true },
    parentName: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sku: { type: String, required: false },
    image: {
      url: { type: String, required: true },
      altText: { type: String },
    },
    price: { type: Number, required: true },
    keepTrackInventory: { type: Boolean, required: false, default: false },
    countInStock: { type: Number, required: false, default: 0 },
    weight: { type: Number, required: false },
  },
  {
    timestamps: true,
  }
);

const SubProduct =
  mongoose.models.SubProduct || mongoose.model('SubProduct', SubProductSchema);

export default SubProduct;
