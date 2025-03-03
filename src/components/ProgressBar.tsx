import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, labels }) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-black bg-blue-200">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-black">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
          <div
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-in-out"
          />
        </div>
        {labels && (
          <div className="flex justify-between text-xs text-black">
            {labels.map((label, index) => (
              <div
                key={index}
                className={`${
                  index + 1 <= currentStep ? 'text-black font-semibold' : ''
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;