import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    metaDesc: { type: String, required: true, unique: true },
    image: {
      url: { type: String, required: true },
      altText: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.models.Blog || mongoose.model('blog', BlogSchema);
export default Blog;
