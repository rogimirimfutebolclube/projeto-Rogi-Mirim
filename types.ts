
export enum Category {
  SUB_11 = "Sub-11 (2015-2016)",
  SUB_13 = "Sub-13 (2013-2014)",
  SUB_15 = "Sub-15 (2011-2012)",
  SUB_17 = "Sub-17 (2009-2010)",
  NUCLEO = "Núcleo (2017-2021)",
}

export type Guardian = {
  fullName: string;
  rg: string;
  cpf: string;
  address: string;
  whatsapp: string;
  peopleWorkingInHouse: number;
  peopleLivingInHouse: number;
};

export type Athlete = {
  id: string;
  fullName: string;
  birthDate: string;
  position: string;
  category: Category;
  schoolName: string;
  schoolGrade: string;
  schoolHours: string;
  address: string;
  whatsapp: string;
  guardian: Guardian;
};

export type ScheduleItem = {
    category: Category;
    days: string;
    time: string;
    location: string;
};
