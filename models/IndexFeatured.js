import mongoose from 'mongoose';

const IndexFeaturedSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    alt: { type: String, required: true },
    link: { type: String, required: true },
    order: { type: Number, required: true },
    live: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

const IndexFeatured =
  mongoose.models.IndexFeatured ||
  mongoose.model('IndexFeatured', IndexFeaturedSchema);
export default IndexFeatured;


