import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: false },
    subcategory: { type: String, required: false },
    image: { type: String, required: true },
    price: { type: Number, required: true, default: false },
    brand: { type: String, required: false },
    sku: {type: String, required: false},
    rating: { type: Number, required: false, default: 0 },
    numReviews: { type: Number, required: false, default: 0 },
    keepTrackInventory: { type: Boolean, required: false, default: false },
    countInStock: { type: Number, required: false, default: 0 },
    description: { type: String, required: true },
    weight: { type: String, required: false },
    option: {type: String, required: false},
    variant: {type: String, required: false},
    
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;
