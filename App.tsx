
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Athlete, ScheduleItem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import InscriptionForm from './components/InscriptionForm';
import AttendanceList from './components/AttendanceList';
import Schedule from './components/Schedule';
import AthleteDetails from './components/AthleteDetails';
import Footer from './components/Footer';
import { INITIAL_SCHEDULES } from './constants';

function App() {
  const [athletes, setAthletes, isAthletesSyncing] = useLocalStorage<Athlete[]>('athletes', []);
  const [schedules, setSchedules, isSchedulesSyncing] = useLocalStorage<ScheduleItem[]>('schedules', INITIAL_SCHEDULES);

  const addAthlete = (athlete: Athlete) => {
    setAthletes(prev => [...prev, athlete]);
  };

  const isSyncing = isAthletesSyncing || isSchedulesSyncing;

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
        <Header isSyncing={isSyncing} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<InscriptionForm addAthlete={addAthlete} />} />
            <Route path="/lista-de-chamada" element={<AttendanceList athletes={athletes} setAthletes={setAthletes} />} />
            <Route path="/horarios" element={<Schedule schedules={schedules} setSchedules={setSchedules} />} />
            <Route path="/atletas" element={<AthleteDetails athletes={athletes} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
