
import React, { useState } from 'react';
import { Athlete, Category } from '../types';
import { CATEGORIES } from '../constants';

interface AthleteDetailsProps {
  athletes: Athlete[];
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-2">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <p className="mt-1 text-md text-gray-200">{value}</p>
    </div>
);

const AthleteDetails: React.FC<AthleteDetailsProps> = ({ athletes }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const [expandedAthleteId, setExpandedAthleteId] = useState<string | null>(null);

  const groupedAthletes = athletes.reduce((acc, athlete) => {
    const category = athlete.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(athlete);
    return acc;
  }, {} as Record<Category, Athlete[]>);

  const toggleExpand = (athleteId: string) => {
    setExpandedAthleteId(prevId => (prevId === athleteId ? null : athleteId));
  };

  const activeTabStyle = "bg-blue-600 text-white";
  const inactiveTabStyle = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-yellow-400">Detalhes dos Atletas</h1>

      {athletes.length === 0 ? (
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-lg">
          <p className="text-gray-400 text-lg">Nenhum atleta inscrito ainda.</p>
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

          <div className="space-y-4">
            {(groupedAthletes[activeCategory] && groupedAthletes[activeCategory].length > 0) ? (
              groupedAthletes[activeCategory].sort((a, b) => a.fullName.localeCompare(b.fullName)).map((athlete) => (
                <div key={athlete.id} className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                  <button
                    onClick={() => toggleExpand(athlete.id)}
                    className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-700/50 transition"
                    aria-expanded={expandedAthleteId === athlete.id}
                  >
                    <h2 className="text-lg font-semibold text-white">{athlete.fullName}</h2>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transition-transform ${expandedAthleteId === athlete.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedAthleteId === athlete.id && (
                    <div className="p-6 border-t border-gray-700 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Athlete Details */}
                        <div>
                          <h3 className="text-xl font-semibold text-blue-400 mb-3 border-b border-gray-600 pb-2">Dados do Atleta</h3>
                          <div className="space-y-2">
                            <DetailItem label="Data de Nascimento" value={new Date(athlete.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} />
                            <DetailItem label="Posição" value={athlete.position} />
                            <DetailItem label="Endereço" value={athlete.address} />
                            <DetailItem label="WhatsApp" value={athlete.whatsapp} />
                            <DetailItem label="Escola" value={athlete.schoolName} />
                            <DetailItem label="Série e Horário" value={`${athlete.schoolGrade} (${athlete.schoolHours})`} />
                          </div>
                        </div>

                        {/* Guardian Details */}
                        <div>
                           <h3 className="text-xl font-semibold text-blue-400 mb-3 border-b border-gray-600 pb-2">Dados do Responsável</h3>
                           <div className="space-y-2">
                            <DetailItem label="Nome" value={athlete.guardian.fullName} />
                            <DetailItem label="RG" value={athlete.guardian.rg} />
                            <DetailItem label="CPF" value={athlete.guardian.cpf} />
                            <DetailItem label="Endereço" value={athlete.guardian.address} />
                            <DetailItem label="WhatsApp" value={athlete.guardian.whatsapp} />
                            <DetailItem label="Pessoas na Casa" value={`${athlete.guardian.peopleLivingInHouse} moram, ${athlete.guardian.peopleWorkingInHouse} trabalham.`} />
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum atleta nesta categoria.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteDetails;
