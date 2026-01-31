
import React, { useState } from 'react';
import { Athlete, Category } from '../types';
import { CATEGORIES } from '../constants';

interface AttendanceListProps {
  athletes: Athlete[];
  setAthletes: React.Dispatch<React.SetStateAction<Athlete[]>>;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ athletes, setAthletes }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const groupedAthletes = athletes.reduce((acc, athlete) => {
    const category = athlete.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(athlete);
    return acc;
  }, {} as Record<Category, Athlete[]>);

  const handleAttendanceChange = (athleteId: string, isPresent: boolean) => {
    const updatedAthletes = athletes.map(athlete => {
      if (athlete.id === athleteId) {
        const updatedAttendance = { ...athlete.attendance, [selectedDate]: isPresent };
        // If unchecking, remove the entry to save space
        if (!isPresent) {
            delete updatedAttendance[selectedDate];
        }
        return { ...athlete, attendance: updatedAttendance };
      }
      return athlete;
    });
    setAthletes(updatedAthletes);
  };

  const activeTabStyle = "bg-blue-600 text-white";
  const inactiveTabStyle = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4 text-yellow-400">Lista de Chamada</h1>
      
      <div className="mb-8 flex justify-center">
        <div className="inline-flex flex-col items-center">
            <label htmlFor="attendance-date" className="block text-sm font-medium text-gray-300 mb-1">Selecione a Data do Treino:</label>
            <input 
                type="date" 
                id="attendance-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
        </div>
      </div>
      
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
                            <label htmlFor={`athlete-${athlete.id}`} className="text-gray-200 cursor-pointer">{athlete.fullName}</label>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-400 mr-4 hidden sm:inline">Nasc: {new Date(athlete.birthDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                            <input
                                type="checkbox"
                                id={`athlete-${athlete.id}`}
                                className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-600 cursor-pointer"
                                checked={athlete.attendance?.[selectedDate] || false}
                                onChange={(e) => handleAttendanceChange(athlete.id, e.target.checked)}
                            />
                        </div>
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
