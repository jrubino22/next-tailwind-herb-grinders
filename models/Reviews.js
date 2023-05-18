import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'] 
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    content: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export default Review;
