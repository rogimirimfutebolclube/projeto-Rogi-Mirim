
import React, { useState, useEffect } from 'react';
import { Athlete, Guardian } from '../types';
import { POSITIONS, getCategoryByBirthDate } from '../constants';
import Input from './Input';
import Select from './Select';

interface InscriptionFormProps {
  addAthlete: (athlete: Athlete) => boolean;
}

const initialFormData = {
  athleteName: '',
  birthDate: '',
  position: '',
  schoolName: '',
  schoolGrade: '',
  schoolHours: '',
  athleteAddress: '',
  athleteWhatsapp: '',
  guardianName: '',
  rg: '',
  cpf: '',
  guardianAddress: '',
  guardianWhatsapp: '',
  peopleWorking: '0',
  peopleLiving: '0',
};

const InscriptionForm: React.FC<InscriptionFormProps> = ({ addAthlete }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [category, setCategory] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const determinedCategory = getCategoryByBirthDate(formData.birthDate);
    setCategory(determinedCategory ? determinedCategory : 'Data de nascimento inválida para as categorias existentes.');
  }, [formData.birthDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const determinedCategory = getCategoryByBirthDate(formData.birthDate);
    if (!determinedCategory) {
      alert("Não é possível registrar. A data de nascimento não corresponde a nenhuma categoria válida.");
      return;
    }

    const guardian: Guardian = {
      fullName: formData.guardianName,
      rg: formData.rg,
      cpf: formData.cpf,
      address: formData.guardianAddress,
      whatsapp: formData.guardianWhatsapp,
      peopleWorkingInHouse: parseInt(formData.peopleWorking, 10),
      peopleLivingInHouse: parseInt(formData.peopleLiving, 10),
    };

    const newAthlete: Athlete = {
      id: new Date().toISOString(),
      fullName: formData.athleteName,
      birthDate: formData.birthDate,
      position: formData.position,
      category: determinedCategory,
      schoolName: formData.schoolName,
      schoolGrade: formData.schoolGrade,
      schoolHours: formData.schoolHours,
      address: formData.athleteAddress,
      whatsapp: formData.athleteWhatsapp,
      guardian: guardian,
      attendance: {},
    };

    const success = addAthlete(newAthlete);
    if (success) {
      setFormData(initialFormData);
      setShowSuccess(true);
      setShowError(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setShowError(true);
      setShowSuccess(false);
      setTimeout(() => setShowError(false), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl">
      <h1 className="text-3xl font-bold text-center mb-2 text-yellow-400">Ficha de Inscrição de Atleta</h1>
      <p className="text-center text-gray-400 mb-8">Preencha todos os campos abaixo com atenção.</p>

      {showSuccess && (
        <div className="bg-green-500 text-white p-4 rounded-md mb-6 text-center">
          Atleta inscrito com sucesso!
        </div>
      )}
      
      {showError && (
        <div className="bg-red-500 text-white p-4 rounded-md mb-6 text-center">
          Este atleta já está inscrito. Verifique o nome completo e a data de nascimento.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Athlete Section */}
        <div className="p-6 border border-gray-700 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 border-b-2 border-blue-500 pb-2 text-white">Dados do Atleta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome Completo" id="athleteName" name="athleteName" value={formData.athleteName} onChange={handleChange} required />
            <Input label="Data de Nascimento" id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required />
            <div className="md:col-span-2">
                {formData.birthDate && <p className="mt-2 text-sm text-yellow-400">Categoria: {category}</p>}
            </div>
            <Select label="Posição que Joga" id="position" name="position" value={formData.position} onChange={handleChange} required>
              <option value="">Selecione a posição</option>
              {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
            </Select>
            <Input label="Escola que Estuda" id="schoolName" name="schoolName" value={formData.schoolName} onChange={handleChange} required />
            <Input label="Série" id="schoolGrade" name="schoolGrade" value={formData.schoolGrade} onChange={handleChange} required />
            <Input label="Horário das Aulas" id="schoolHours" name="schoolHours" value={formData.schoolHours} onChange={handleChange} required />
            <Input label="Endereço Completo" id="athleteAddress" name="athleteAddress" value={formData.athleteAddress} onChange={handleChange} required />
            <Input label="WhatsApp" id="athleteWhatsapp" name="athleteWhatsapp" type="tel" value={formData.athleteWhatsapp} onChange={handleChange} required />
          </div>
        </div>

        {/* Guardian Section */}
        <div className="p-6 border border-gray-700 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 border-b-2 border-blue-500 pb-2 text-white">Dados do Responsável</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome Completo do Responsável" id="guardianName" name="guardianName" value={formData.guardianName} onChange={handleChange} required />
            <Input label="RG" id="rg" name="rg" value={formData.rg} onChange={handleChange} required />
            <Input label="CPF" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required />
            <Input label="Endereço Completo" id="guardianAddress" name="guardianAddress" value={formData.guardianAddress} onChange={handleChange} required />
            <Input label="WhatsApp do Responsável" id="guardianWhatsapp" name="guardianWhatsapp" type="tel" value={formData.guardianWhatsapp} onChange={handleChange} required />
            <Input label="Quantas pessoas trabalham na casa?" id="peopleWorking" name="peopleWorking" type="number" min="0" value={formData.peopleWorking} onChange={handleChange} required />
            <Input label="Quantas pessoas moram na casa?" id="peopleLiving" name="peopleLiving" type="number" min="0" value={formData.peopleLiving} onChange={handleChange} required />
          </div>
        </div>

        <div className="text-center">
          <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
            Inscrever Atleta
          </button>
        </div>
      </form>
    </div>
  );
};

export default InscriptionForm;
