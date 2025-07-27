export interface SampleDTO {
  id: string;
  patientName: string;
  registeredByName: string;
  type: 'BLOOD' | 'DNA' | 'SALIVA';
  status: string;
  collectionDate: string;
  notes: string;
  bloodData?: any;
  dnaData?: any;
  salivaData?: any;
}