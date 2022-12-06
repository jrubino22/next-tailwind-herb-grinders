import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
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

const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
export default Banner;
