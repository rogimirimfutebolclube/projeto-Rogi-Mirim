
import React, { useState } from 'react';
import { ScheduleItem, Category } from '../types';
import Input from './Input';

interface ScheduleProps {
    schedules: ScheduleItem[];
    setSchedules: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
}

const Schedule: React.FC<ScheduleProps> = ({ schedules, setSchedules }) => {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editFormData, setEditFormData] = useState<Omit<ScheduleItem, 'category'>>({ days: '', time: '', location: '' });

    const handleEdit = (schedule: ScheduleItem) => {
        setEditingCategory(schedule.category);
        setEditFormData({ days: schedule.days, time: schedule.time, location: schedule.location });
    };

    const handleCancel = () => {
        setEditingCategory(null);
    };

    const handleSave = () => {
        if (!editingCategory) return;
        
        setSchedules(schedules.map(s => 
            s.category === editingCategory ? { ...s, ...editFormData } : s
        ));
        setEditingCategory(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-yellow-400">Horários de Treino</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {schedules.map((schedule) => (
                    <div key={schedule.category} className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col p-6 transition-all duration-300">
                        <h2 className="text-xl font-bold text-blue-400 mb-4">{schedule.category}</h2>
                        {editingCategory === schedule.category ? (
                            <div className="space-y-4 flex-grow flex flex-col">
                                <Input label="Dias" id={`days-${schedule.category}`} name="days" value={editFormData.days} onChange={handleChange} />
                                <Input label="Horário" id={`time-${schedule.category}`} name="time" value={editFormData.time} onChange={handleChange} />
                                <Input label="Local" id={`location-${schedule.category}`} name="location" value={editFormData.location} onChange={handleChange} />
                                <div className="mt-auto pt-4 flex justify-end space-x-2">
                                    <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition">Cancelar</button>
                                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">Salvar</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 text-gray-300 flex-grow flex flex-col">
                                <p className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <strong>Dias:</strong><span className="ml-2">{schedule.days}</span>
                                </p>
                                <p className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <strong>Horário:</strong><span className="ml-2">{schedule.time}</span>
                                </p>
                                <p className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <strong>Local:</strong><span className="ml-2">{schedule.location}</span>
                                </p>
                                <div className="mt-auto pt-4 flex justify-end">
                                    <button onClick={() => handleEdit(schedule)} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded transition">Editar</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Schedule;
