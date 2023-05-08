import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    subtitle: { type: String },
    content: { type: String, required: true },
    metaDesc: { type: String, required: true },
    image: {
      url: { type: String },
      altText: { type: String },
    },
    isActive: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const Page =
  mongoose.models.Page || mongoose.model('Page', PageSchema);
export default Page;
