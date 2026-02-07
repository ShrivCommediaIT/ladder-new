

// ===================== ==>

  import React from "react";

const AvailableLabel = () => {
  return (
    <div className="">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 sm:gap-4">
        <span className="bg-green-300 py-2 px-6 sm:px-12 text-sm sm:text-base font-semibold text-center rounded-md shadow-sm w-full sm:w-auto">
          Available
        </span>
        <span className="bg-blue-100 py-2 px-6 sm:px-12 text-sm sm:text-base font-semibold text-center rounded-md shadow-sm w-full sm:w-auto">
          Unavailable
        </span>
      </div>
    </div>
  );
};

export default AvailableLabel;
