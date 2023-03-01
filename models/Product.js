import SubProduct from './SubProduct';
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: false },
    subcategory: { type: String, required: false },
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
        displayOrder: { type: Number },
      },
    ],
    price: { type: Number, required: true, default: false },
    brand: { type: String, required: false },
    sku: { type: String, required: false },
    rating: { type: Number, required: false, default: 0 },
    numReviews: { type: Number, required: false, default: 0 },
    keepTrackInventory: { type: Boolean, required: false, default: false },
    countInStock: { type: Number, required: false, default: 0 },
    description: { type: String, required: true },
    weight: { type: String, required: false },
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: SubProduct, required: false }],
  },
  {
    timestamps: true,
  }
);

ProductSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('images')) {
    this.images.forEach((image, index) => {
      image.displayOrder = index + 1;
    });
  }
  next();
});

const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;
