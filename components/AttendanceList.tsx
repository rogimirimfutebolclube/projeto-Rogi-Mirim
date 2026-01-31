
import React, { useState } from 'react';
import { Athlete, Category } from '../types';
import { CATEGORIES } from '../constants';

interface AttendanceListProps {
  athletes: Athlete[];
  setAthletes: React.Dispatch<React.SetStateAction<Athlete[]>>;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ athletes, setAthletes }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const [expandedAthleteId, setExpandedAthleteId] = useState<string | null>(null);
  
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

  const toggleExpand = (athleteId: string) => {
    setExpandedAthleteId(prevId => (prevId === athleteId ? null : athleteId));
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
                  {groupedAthletes[activeCategory].sort((a, b) => a.fullName.localeCompare(b.fullName)).map((athlete, index) => {
                    const attendanceDates = Object.keys(athlete.attendance || {})
                        .filter(date => athlete.attendance[date])
                        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                    
                    return (
                      <li key={athlete.id} className="py-3 px-2 transition-colors hover:bg-gray-700/50 rounded-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <span className="text-blue-400 font-bold w-8 flex-shrink-0 text-center">{index + 1}.</span>
                                <span className="text-gray-200 ml-2 truncate">{athlete.fullName}</span>
                            </div>
                            <div className="flex items-center flex-shrink-0 ml-4">
                                <label htmlFor={`athlete-${athlete.id}`} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id={`athlete-${athlete.id}`}
                                        className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-600 cursor-pointer"
                                        checked={athlete.attendance?.[selectedDate] || false}
                                        onChange={(e) => handleAttendanceChange(athlete.id, e.target.checked)}
                                    />
                                    <span className="ml-2 text-gray-300 hidden sm:inline">Presente</span>
                                </label>
                                <button 
                                    onClick={() => toggleExpand(athlete.id)} 
                                    className="ml-4 text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-600"
                                    aria-label={`Ver histórico de ${athlete.fullName}`}
                                    aria-expanded={expandedAthleteId === athlete.id}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedAthleteId === athlete.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {expandedAthleteId === athlete.id && (
                            <div className="mt-4 pl-10 pr-4 pb-2 animate-fade-in">
                                <h4 className="font-semibold text-gray-300 border-b border-gray-600 pb-1 mb-2">
                                    Histórico de Presença ({attendanceDates.length} {attendanceDates.length === 1 ? 'dia' : 'dias'})
                                </h4>
                                {attendanceDates.length > 0 ? (
                                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm text-gray-400">
                                        {attendanceDates.map(date => (
                                            <li key={date} className="bg-gray-700 rounded px-2 py-1 text-center">
                                                {new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Nenhuma presença registrada.</p>
                                )}
                            </div>
                        )}
                      </li>
                    )
                  })}
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
