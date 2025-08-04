import React from 'react';

const SafeCheckerSimple = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">SafeChecker - Simple Version</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Token Scanner</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter token contract address..."
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Scan Token
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
          <p className="text-gray-300">
            This is a simplified version of SafeChecker to test if the component loads properly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafeCheckerSimple;