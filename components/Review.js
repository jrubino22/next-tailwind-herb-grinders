import React from 'react';
import PropTypes from 'prop-types';
import ReactStars from "react-rating-stars-component";

const Review = ({ review }) => (
  <div className="review p-4 bg-white rounded shadow-md">
    <h3 className="font-bold mb-2">{review.title}</h3>
    <ReactStars activeColor="#F99B1D" size={24} value={review.rating} edit={false}/>
    <p className="my-4">{review.content}</p>
    <small className="block text-gray-500">Posted by: {review.name} on {new Date(review.createdAt).toLocaleDateString()}</small>
  </div>
)

Review.propTypes = {
    review: PropTypes.object.isRequired,
  };

export default Review