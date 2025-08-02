export interface BloodSampleData {
  glucoseMgDl?: number;
  cholesterolTotalMgDl?: number;
  cholesterolHdlMgDl?: number;
  cholesterolLdlMgDl?: number;
  triglyceridesMgDl?: number;
  creatinineMgDl?: number;
  ureaMgDl?: number;
  hemoglobinGDl?: number;
  hematocritPercent?: number;
  redBloodCellsMillionUl?: number;
  whiteBloodCellsThousandUl?: number;
  plateletsThousandUl?: number;
  altSgptUL?: number;
  astSgotUL?: number;
  bilirubinTotalMgDl?: number;
  alkalinePhosphataseUL?: number;
  bunMgDl?: number;
  gfrMlMin?: number;
  totalProteinGDl?: number;
  albuminGDl?: number;
  sodiumMeqL?: number;
  potassiumMeqL?: number;
  chlorideMeqL?: number;
  cReactiveProteinMgL?: number;
  creactiveProteinMgL?: number; // Parece ser duplicado en el JSON
  esrMmHr?: number;
  geneticMarkersDetected?: number;
  geneticQualityScore?: number;
  labReferenceValues?: string;
  analyzerModel?: string;
  centrifugationSpeedRpm?: number;
  storageTemperatureCelsius?: number;
}

export interface DnaSampleData {
  concentrationNgUl?: number;
  purity260280Ratio?: number;
  purity260230Ratio?: number;
  integrityNumber?: number;
  extractionMethod?: string;
  extractionDate?: string;
  extractionTechnician?: string;
  storageBuffer?: string;
  aliquotVolumeUl?: number;
  freezerLocation?: string;
  sequencingPlatform?: string;
  sequencingDepth?: number;
  libraryPrepProtocol?: string;
  totalReads?: number;
  mappedReads?: number;
  mappingQualityScore?: number;
  variantsDetected?: number;
  snpsDetected?: number;
  indelsDetected?: number;
  fastqR1Url?: string;
  fastqR2Url?: string;
  vcfFileUrl?: string;
  bamFileUrl?: string;
}

export interface SalivaSampleData {
  volumeMl?: number;
  phLevel?: number;
  viscosity?: string;
  dnaYieldNg?: number;
  cellCountPerMl?: number;
  collectionMethod?: string;
  fastingStatus?: boolean;
  contaminationLevel?: string;
  preservativeUsed?: string;
  timeToProcessingHours?: number;
  storageTemperatureCelsius?: number;
}

export interface Sample {
  id: string;
  patientName: string;
  registeredByName: string;
  type: string;
  status: string;
  collectionDate: string;
  notes?: string;
  bloodData?: BloodSampleData;
  dnaData?: DnaSampleData;
  salivaData?: SalivaSampleData;
}

export interface StudyReport {
  fechaEstudio: string;
  tipoMuestra: string;
  modeloAnalizador: string;
  hallazgosPrincipales: string;
}

export interface AIReport {
  reporteMedico: {
    paciente: {
      nombre: string;
      fechaNacimiento: string;
      curp: string;
    };
    historialMedico: Array<{
      fechaVisita: string;
      diagnostico: string | null;
      recomendaciones: string[] | null;
      notas: string | null;
    }>;
    reportesEstudiosRecientes: StudyReport[];
    resumen: {
      texto: string;
      enfermedadesDetectadas: string[];
    };
    recomendaciones: string[];
  };
}