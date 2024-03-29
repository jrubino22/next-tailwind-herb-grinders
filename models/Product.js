import SubProduct from './SubProduct';
import Category from './Category';
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bigComId: { type: Number, unique: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Category,
      required: false,
      default: null,
    },
    subcategory: { type: String, required: false },
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
        displayOrder: { type: Number },
      },
    ],
    price: { type: Number, required: true, default: 0 },
    compareAtPrice: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: false },
    brand: { type: String, required: false, default: '' },
    sku: { type: String, required: false, default: '' },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    keepTrackInventory: { type: Boolean, required: false, default: false },
    countInStock: { type: Number, required: false, default: 0 },
    features: {
      type: String,
      required: false,
      default: 'should be bullet points of features',
    },
    description: { type: String, required: true },
    metaDesc: { type: String, required: false, default: '' },
    tags: { type: [String], default: [] },
    weight: { type: Number, required: false, default: 0 },
    onlyImported: { type: Boolean, required: true, default: false },
    options: {
      type: [
        {
          name: { type: String, required: true },
          values: [{ type: String, required: true }],
        },
      ],
      _id: false,
      timestamps: false, // Disable _id and timestamps for options
      default: [],
    },
    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: SubProduct,
        required: false,
      },
    ],
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
