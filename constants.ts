
import { Category, ScheduleItem } from './types';

export const POSITIONS = [
  "Goleiro",
  "Zagueiro",
  "Lateral Direito",
  "Lateral Esquerdo",
  "Volante",
  "Meio-Campo",
  "Atacante",
  "Ponta Direita",
  "Ponta Esquerda",
];

export const CATEGORIES = [
  Category.NUCLEO,
  Category.SUB_11,
  Category.SUB_13,
  Category.SUB_15,
  Category.SUB_17,
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
    {
        category: Category.NUCLEO,
        days: "Terças e Quintas",
        time: "09:00 - 10:00",
        location: "Campo Principal"
    },
    {
        category: Category.SUB_11,
        days: "Terças e Quintas",
        time: "10:00 - 11:30",
        location: "Campo Principal"
    },
    {
        category: Category.SUB_13,
        days: "Segundas e Quartas",
        time: "14:00 - 15:30",
        location: "Campo Principal"
    },
    {
        category: Category.SUB_15,
        days: "Segundas e Quartas",
        time: "15:30 - 17:00",
        location: "Campo Principal"
    },
    {
        category: Category.SUB_17,
        days: "Sextas",
        time: "15:00 - 17:00",
        location: "Campo Principal"
    }
];

export function getCategoryByBirthDate(birthDate: string): Category | null {
  if (!birthDate) return null;
  const year = new Date(birthDate).getFullYear();
  if (year >= 2017 && year <= 2021) return Category.NUCLEO;
  if (year >= 2015 && year <= 2016) return Category.SUB_11;
  if (year >= 2013 && year <= 2014) return Category.SUB_13;
  if (year >= 2011 && year <= 2012) return Category.SUB_15;
  if (year >= 2009 && year <= 2010) return Category.SUB_17;
  return null;
}
