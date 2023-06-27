
import React from "react";

export default function AgeVerificationModal({onConfirm, onReject}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Age Verification</h2>
        <p className="mb-4">Are you 18 years of age or older?</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
          >
            Yes
          </button>
          <button 
            onClick={onReject}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}