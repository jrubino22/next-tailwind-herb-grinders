import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Review from './Review';
import NewReviewForm from './NewReviewForm';

const Reviews = ({ productId }) => {
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const response = await axios.get(`/api/reviews?productId=${productId}`);
      setReviews(response.data);
    };

    fetchReviews();
  }, [productId]);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const addReview = (newReview) => {
    setReviews((prevReviews) => [...prevReviews, newReview]);
    toggleForm();
  };

  return (
    <>
    <hr className="my-10 border-t"/>
    <div className="reviews space-y-6">
      <div className="md:flex md:justify-between md:items-center mb-4">
        <h2 className="text-xl font-bold">Product Reviews</h2>
        <button
          className="mt-4 md:mt-0 button-color hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={toggleForm}
        >
          {showForm ? 'Close Form' : 'Add a review'}
        </button>
      </div>
      {showForm && (
        <div className="mt-8 bg-white shadow-md rounded p-4">
          <NewReviewForm productId={productId} addReview={addReview} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.length > 0
          ? reviews.map((review) => (
              <Review key={review._id} review={review} />
            ))
          : 'No reviews yet.'}
      </div>
    </div>
    </>
  );
};

Reviews.propTypes = {
  productId: PropTypes.string.isRequired,
};

export default Reviews;