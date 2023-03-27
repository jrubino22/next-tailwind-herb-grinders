import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    metaDesc: { type: String, required: true, unique: true },
    isTags: { type: Boolean, required: true, default: false },
    productTags: { type: [String], default: [] },
    useBanner: { type: Boolean, required: true, default: false },
    image: {
      url: { type: String, required: false },
      altText: { type: String, required: false },
    },
  },
  {
    timestamps: true,
  }
);

delete mongoose.connection.models['category'];
const Category =
  mongoose.models.Category || mongoose.model('category', CategorySchema);
export default Category;
