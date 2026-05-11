import React from 'react';

const StatCard = ({ title, value, subValue, icon: Icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 text-gray-500 mb-1">
            {Icon && <Icon size={16} />}
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{value}</div>
          <div className="mt-2 flex items-center text-xs">
            {trend && (
              <span className={`font-semibold mr-1 ${trend.startsWith('+') ? 'text-green-600' : trend.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                {trend}
              </span>
            )}
            <span className="text-gray-400">{subValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
