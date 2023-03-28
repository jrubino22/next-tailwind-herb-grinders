import React, { useState, useEffect } from 'react';

const WeightInputComponent = ({ onChange, initialWeightInGrams }) => {
  const [weight, setWeight] = useState(initialWeightInGrams || 0);
  const [displayWeight, setDisplayWeight] = useState(0);
  const [unit, setUnit] = useState('g');

  useEffect(() => {
    setDisplayWeight(weight);
    setUnit('g');
  }, [weight]);

  const handleWeightChange = (e) => {
    setDisplayWeight(e.target.value);
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  const handleBlur = () => {
    const weightInGrams = convertToGrams(displayWeight, unit);
    setWeight(weightInGrams);
    onChange(weightInGrams);
  };

  const convertToGrams = (value, unit) => {
    value = parseFloat(value);
    switch (unit) {
      case 'oz':
        return value * 28.3495;
      case 'lb':
        return value * 453.592;
      default:
        return value;
    }
  };

  return (
    <div className="mb-4">
    <label htmlfor="weight">Weight</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={displayWeight}
        onChange={handleWeightChange}
        onBlur={handleBlur}
      />
      <select value={unit} onChange={handleUnitChange}>
        <option value="g">Grams</option>
        <option value="oz">Ounces</option>
        <option value="lb">Pounds</option>
      </select>
    </div>
  );
};

export default WeightInputComponent;