export interface Sample {
  id: string;
  type: string;
  status: string;
  collectionDate: string;
  registeredByName: string;
  analysisResult?: string;
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