import mongoose from 'mongoose';

const BlogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: {type: String, required: true, unique: true },
    subtitle: { type: String },
    author: {type: String },
    content: { type: String, required: true },
    metaDesc: { type: String, required: true, unique: true },
    image: {
      url: { type: String, required: true },
      altText: { type: String },
    },
    isActive: {type: Boolean, required: true, default: true},
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
export default BlogPost;