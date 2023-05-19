import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import ReactStars from 'react-rating-stars-component';

const NewReviewForm = ({ productId, addReview }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const review = {
      productId,
      name,
      email,
      rating,
      title,
      content,
    };

    const response = await axios.post('/api/reviews', review);
    try {
      addReview(response.data);
      return toast.success('Thank you for your review!');
    } catch {
      return toast.error('Review could not be submitted');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your Name"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your Email"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      <div className="flex items-center space-x-2">
        <span className="text-gray-700">Rating:</span>
        <ReactStars
          count={5}
          size={50}
          activeColor="#F99B1D"
          value={rating}
          onChange={(newRating) => setRating(newRating)}
        />
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review Title"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your Review"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
      />
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        aria-label="submit-review"
      >
        Submit Review
      </button>
    </form>
  );
};

NewReviewForm.propTypes = {
  productId: PropTypes.string.isRequired,
  addReview: PropTypes.func.isRequired,
};

export default NewReviewForm;
