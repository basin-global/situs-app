'use client'

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ReactMarkdown from 'react-markdown';

interface GroupEnsuranceProps {
  ogName: string;
  groupEnsuranceText?: string;
}

const COLORS = ['#34D399', '#60A5FA', '#F87171'];
const BORDER_COLOR = '#ffffff';
const BORDER_WIDTH = 4;
const HOVER_OPACITY = 0.7;

export const GroupEnsurance: React.FC<GroupEnsuranceProps> = ({ ogName, groupEnsuranceText }) => {
  console.log('GroupEnsurance props:', { ogName, groupEnsuranceText });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = [
    { name: `.${ogName} Onchain Group`, value: 50 },
    { name: 'ENSURANCE', value: 40 },
    { name: 'SITUS Protocol', value: 10 }
  ];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const onSectionHover = (index: number) => {
    setActiveIndex(index);
  };

  const onSectionLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          place-based resilience
        </h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          All proceeds from <span className="og-gradient-text">.{ogName}</span> account creation fund nature-based projects that reduce risk and ensure resilience.
        </p>
      </div>

      <div className="relative container mx-auto py-4">
        {/* Top Section */}
        <div 
          className="text-center mb-2 w-full md:w-96 mx-auto"
          onMouseEnter={() => onSectionHover(0)}
          onMouseLeave={onSectionLeave}
          style={{ opacity: activeIndex === null || activeIndex === 0 ? 1 : HOVER_OPACITY }}
        >
          <h3 className="text-xl font-bold flex items-center justify-center mb-2">
            <span className="w-4 h-4 inline-block mr-2 rounded-full" style={{ backgroundColor: COLORS[0] }}></span>
            .{ogName} Onchain Group (50%)
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {groupEnsuranceText ? (
              <ReactMarkdown className="prose dark:prose-invert max-w-none">
                {groupEnsuranceText}
              </ReactMarkdown>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>

        {/* Chart Container - back to larger size */}
        <div className="relative mx-auto w-full md:w-[500px] h-[500px] -mt-4 mb-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={160}
                paddingAngle={5}
                dataKey="value"
                strokeWidth={BORDER_WIDTH}
                stroke={BORDER_COLOR}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index]}
                    opacity={activeIndex === null || activeIndex === index ? 1 : HOVER_OPACITY}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `${value}%`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  border: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Side sections wrapper */}
        <div className="relative w-full flex flex-col md:flex-row justify-between px-4 md:px-8 -mt-16">
          {/* Left Section - ENSURANCE */}
          <div 
            className="md:w-72 text-center md:text-right mb-8 md:mb-0 transition-opacity duration-200"
            onMouseEnter={() => onSectionHover(1)}
            onMouseLeave={onSectionLeave}
            style={{ opacity: activeIndex === null || activeIndex === 1 ? 1 : HOVER_OPACITY }}
          >
            <h3 className="text-xl font-bold flex items-center justify-center md:justify-end mb-2">
              <span className="w-4 h-4 inline-block mr-2 rounded-full" style={{ backgroundColor: COLORS[1] }}></span>
              ENSURANCE (40%)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              40% of proceeds support ecosystem services investments, channeling funds directly into ecosystem restoration and sustainable land management.
            </p>
          </div>

          {/* Right Section - SITUS */}
          <div 
            className="md:w-72 text-center md:text-left transition-opacity duration-200"
            onMouseEnter={() => onSectionHover(2)}
            onMouseLeave={onSectionLeave}
            style={{ opacity: activeIndex === null || activeIndex === 2 ? 1 : HOVER_OPACITY }}
          >
            <h3 className="text-xl font-bold flex items-center justify-center md:justify-start mb-2">
              <span className="w-4 h-4 inline-block mr-2 rounded-full" style={{ backgroundColor: COLORS[2] }}></span>
              SITUS Protocol (10%)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              10% goes to flow.ensitus, which continuously circulates value through each SITUS group and their accounts to support place-based resilience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 