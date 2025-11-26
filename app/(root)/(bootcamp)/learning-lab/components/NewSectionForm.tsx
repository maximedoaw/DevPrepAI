'use client'

import React from 'react'
import { X, Plus, FileText, Video, File } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { NewSectionForm, NewSubSectionForm, CourseContentType, contentTypeLabels } from './types'
import { SubSectionDropzone } from './SubSectionDropzone'

interface NewSectionFormProps {
  newSection: NewSectionForm
  index: number
  canRemove: boolean
  uploadingSubSectionId: string | null
  uploadProgress: Record<string, number>
  uploadStatus: Record<string, 'uploading' | 'success' | 'error'>
  onUpdate: (updates: Partial<NewSectionForm>) => void
  onRemove: () => void
  onAddSubSection: () => void
  onUpdateSubSection: (subSectionTempId: string, updates: Partial<NewSubSectionForm>) => void
  onRemoveSubSection: (subSectionTempId: string) => void
  onSubSectionFileDrop: (subSectionTempId: string, acceptedFiles: File[], rejectedFiles: any[]) => void
}

export function NewSectionFormComponent({
  newSection,
  index,
  canRemove,
  uploadingSubSectionId,
  uploadProgress,
  uploadStatus,
  onUpdate,
  onRemove,
  onAddSubSection,
  onUpdateSubSection,
  onRemoveSubSection,
  onSubSectionFileDrop
}: NewSectionFormProps) {
  return (
    <div 
      className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-700 dark:text-slate-300">
          Chapitre {index + 1}
        </h4>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-6 w-6 text-red-600 dark:text-red-400"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Titre du chapitre *</Label>
        <Input
          value={newSection.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ex: Introduction, Chapitre 1, etc."
          className="border-emerald-200 dark:border-emerald-800"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Leçons *</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSubSection}
            className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une leçon
          </Button>
        </div>

        {newSection.subSections.length === 0 ? (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
            Aucune leçon. Ajoutez-en au moins une pour créer le chapitre.
          </div>
        ) : (
          <div className="space-y-3">
            {newSection.subSections.map((newSubSection, subIndex) => {
              const isSubUploading = uploadingSubSectionId === newSubSection.tempId
              const subUploadStatus = uploadStatus[newSubSection.tempId]
              const subProgress = uploadProgress[newSubSection.tempId] || 0
              
              return (
                <div key={newSubSection.tempId} className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Leçon {subIndex + 1}
                    </h5>
                    {newSection.subSections.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveSubSection(newSubSection.tempId)}
                        className="h-5 w-5 text-red-600 dark:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-medium mb-1 block">Titre de la leçon *</Label>
                    <Input
                      value={newSubSection.title || ''}
                      onChange={(e) => onUpdateSubSection(newSubSection.tempId, { title: e.target.value })}
                      placeholder="Ex: Introduction, Première vidéo, etc."
                      className="border-emerald-200 dark:border-emerald-800 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium mb-1 block">Type de contenu *</Label>
                    <Select
                      value={newSubSection.type}
                      onValueChange={(value) => onUpdateSubSection(newSubSection.tempId, { 
                        type: value as CourseContentType,
                        content: value === CourseContentType.TEXT ? newSubSection.content : '',
                        fileUrl: undefined,
                        fileToUpload: undefined
                      })}
                    >
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800 text-sm h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CourseContentType.VIDEO}>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            {contentTypeLabels[CourseContentType.VIDEO]}
                          </div>
                        </SelectItem>
                        <SelectItem value={CourseContentType.TEXT}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {contentTypeLabels[CourseContentType.TEXT]}
                          </div>
                        </SelectItem>
                        <SelectItem value={CourseContentType.PDF}>
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4" />
                            {contentTypeLabels[CourseContentType.PDF]}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newSubSection.type === CourseContentType.TEXT ? (
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Contenu</Label>
                      <Textarea
                        value={newSubSection.content || ''}
                        onChange={(e) => onUpdateSubSection(newSubSection.tempId, { content: e.target.value })}
                        placeholder="Saisissez le contenu..."
                        className="border-emerald-200 dark:border-emerald-800 min-h-[100px] text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs font-medium mb-1 block">
                        {newSubSection.type === CourseContentType.VIDEO ? 'Fichier vidéo' : 'Fichier PDF'}
                      </Label>
                      <SubSectionDropzone
                        subSection={{ 
                          type: newSubSection.type || CourseContentType.PDF,
                          fileUrl: newSubSection.fileUrl
                        } as any}
                        tempId={newSubSection.tempId}
                        onDrop={(acceptedFiles, rejectedFiles) => onSubSectionFileDrop(newSubSection.tempId, acceptedFiles, rejectedFiles)}
                        onRemove={() => onUpdateSubSection(newSubSection.tempId, { 
                          fileToUpload: undefined, 
                          fileUrl: undefined 
                        })}
                        isUploading={isSubUploading}
                        uploadStatus={subUploadStatus}
                        progress={subProgress}
                        hasFile={!!newSubSection.fileUrl}
                      />
                      {newSubSection.fileToUpload && !newSubSection.fileUrl && !isSubUploading && (
                        <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                          <File className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs text-slate-700 dark:text-slate-300 flex-1 truncate">
                            {newSubSection.fileToUpload.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onUpdateSubSection(newSubSection.tempId, { 
                              fileToUpload: undefined
                            })}
                            className="h-5 w-5"
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

