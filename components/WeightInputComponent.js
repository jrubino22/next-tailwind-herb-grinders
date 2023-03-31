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
    let weightInGrams;
    switch (unit) {
      case 'oz':
        weightInGrams = value * 28.3495;
        break;
      case 'lb':
        weightInGrams = value * 453.592;
        break;
      default:
        weightInGrams = value;
    }
    return parseFloat(weightInGrams.toFixed(2));
  };

  return (
    <div className="mb-4">
    <div>
    <label htmlFor="weight">Weight</label>
    </div>
    <div>
      <input
        className="w-3/4"
        type="number"
        min="0"
        step="0.01"
        autoFocus
        id="weight"
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
    </div>
  );
};

export default WeightInputComponent;