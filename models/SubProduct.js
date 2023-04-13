import mongoose from 'mongoose';

const SubProductSchema = new mongoose.Schema(
  {
    variant: { type: String, required: true },
    parentName: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    slug: { type: String, required: true },
    sku: { type: String, required: false },
    image: {
      url: { type: String, required: false, default: '' },
      altText: { type: String, default: 'default image' },
    },
    price: { type: Number, required: true },
    keepTrackInventory: { type: Boolean, required: false, default: false },
    countInStock: { type: Number, required: false, default: 0 },
    weight: { type: Number, required: true, default: 0 },
    onlyImported: { type: Boolean, required: true, default: false },
    selectedOptions: {
      type: [
        {
          name: { type: String, required: true },
          value: { type: String, required: true },
        },
      ],
      _id: false,
      timestamps: false, // Disable _id and timestamps for selectedOptions
    },
  },
  {
    timestamps: true,
  }
);

const SubProduct =
  mongoose.models.SubProduct || mongoose.model('SubProduct', SubProductSchema);

export default SubProduct;
