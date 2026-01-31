
import React, { useState } from 'react';
import { Athlete, Category } from '../types';
import { CATEGORIES } from '../constants';

interface AttendanceListProps {
  athletes: Athlete[];
}

const AttendanceList: React.FC<AttendanceListProps> = ({ athletes }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);

  const groupedAthletes = athletes.reduce((acc, athlete) => {
    const category = athlete.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(athlete);
    return acc;
  }, {} as Record<Category, Athlete[]>);

  const activeTabStyle = "bg-blue-600 text-white";
  const inactiveTabStyle = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-yellow-400">Lista de Chamada por Categoria</h1>
      
      {athletes.length === 0 ? (
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-lg">
            <p className="text-gray-400 text-lg">Nenhum atleta inscrito ainda.</p>
            <p className="text-gray-500 mt-2">Os atletas aparecerão aqui após o preenchimento da ficha de inscrição.</p>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${activeCategory === category ? activeTabStyle : inactiveTabStyle}`}
              >
                {category.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
              <h2 className="bg-gray-700 text-xl font-semibold p-4 text-white border-b border-gray-600">{activeCategory}</h2>
              <div className="p-4">
              {(groupedAthletes[activeCategory] && groupedAthletes[activeCategory].length > 0) ? (
                  <ul className="divide-y divide-gray-700">
                  {groupedAthletes[activeCategory].sort((a, b) => a.fullName.localeCompare(b.fullName)).map((athlete, index) => (
                      <li key={athlete.id} className="py-3 px-2 flex items-center justify-between hover:bg-gray-700/50 rounded-md">
                      <div className="flex items-center">
                          <span className="text-blue-400 font-bold w-8 text-center">{index + 1}.</span>
                          <span className="text-gray-200">{athlete.fullName}</span>
                      </div>
                      <span className="text-sm text-gray-400">Nasc: {new Date(athlete.birthDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                      </li>
                  ))}
                  </ul>
              ) : (
                  <p className="text-gray-500 px-2 py-3">Nenhum atleta nesta categoria.</p>
              )}
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
