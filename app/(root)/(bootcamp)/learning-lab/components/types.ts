// Types et interfaces partagés pour la gestion des sections de cours

export enum CourseContentType {
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  PDF = 'PDF'
}

// Leçon avec contenu
export interface SubSection {
  id: string
  title: string
  type: CourseContentType
  content?: string // Pour TEXT
  fileUrl?: string // Pour VIDEO et PDF
  order: number
}

// Section (chapitre) qui contient des leçons
export interface Section {
  id: string
  title: string
  order: number
  subSections: SubSection[]
}

export interface NewSubSectionForm extends Partial<SubSection> {
  tempId: string
  fileToUpload?: File
}

export interface NewSectionForm {
  tempId: string
  title: string
  subSections: NewSubSectionForm[]
}

export const contentTypeLabels: Record<CourseContentType, string> = {
  [CourseContentType.VIDEO]: 'Vidéo',
  [CourseContentType.TEXT]: 'Texte',
  [CourseContentType.PDF]: 'PDF'
}

