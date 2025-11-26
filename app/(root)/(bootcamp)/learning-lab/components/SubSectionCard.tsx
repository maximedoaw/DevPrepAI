'use client'

import React from 'react'
import { ChevronRight, X, FileText, Video, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { SubSection, CourseContentType, contentTypeLabels } from './types'
import { SubSectionDropzone } from './SubSectionDropzone'

const contentTypeIcons: Record<CourseContentType, typeof FileText> = {
  [CourseContentType.VIDEO]: Video,
  [CourseContentType.TEXT]: FileText,
  [CourseContentType.PDF]: File
}

interface SubSectionCardProps {
  subSection: SubSection
  sectionId: string
  subIndex: number
  isExpanded: boolean
  isEditing: boolean
  isUploading: boolean
  uploadStatus?: 'uploading' | 'success' | 'error'
  progress: number
  onToggleExpand: () => void
  onEdit: () => void
  onUpdate: (updates: Partial<SubSection>) => void
  onDelete: () => void
  onFileDrop: (acceptedFiles: File[], rejectedFiles: any[]) => void
  onRemoveFile?: () => void
}

export function SubSectionCard({
  subSection,
  sectionId,
  subIndex,
  isExpanded,
  isEditing,
  isUploading,
  uploadStatus,
  progress,
  onToggleExpand,
  onEdit,
  onUpdate,
  onDelete,
  onFileDrop,
  onRemoveFile
}: SubSectionCardProps) {
  const Icon = contentTypeIcons[subSection.type]

  return (
    <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleExpand}
              className="h-6 w-6"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={subSection.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="border-emerald-200 dark:border-emerald-800 text-sm h-8"
                  onBlur={() => {}}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onEdit()
                    }
                  }}
                  autoFocus
                />
              ) : (
                <>
                  <h4 
                    className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                    onClick={onEdit}
                  >
                    {subSection.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                      {contentTypeLabels[subSection.type]}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Leçon {subIndex + 1}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-6 w-6 text-red-600 dark:text-red-400"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
          {/* Permettre de changer le type de contenu uniquement si aucun fichier n'est uploadé */}
          {!subSection.fileUrl && (
            <div>
              <Label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Type de contenu</Label>
              <Select
                value={subSection.type}
                onValueChange={(value) => {
                  const newType = value as CourseContentType
                  onUpdate({
                    type: newType,
                    content: newType === CourseContentType.TEXT ? subSection.content : undefined,
                    fileUrl: undefined
                  })
                }}
              >
                <SelectTrigger className="border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CourseContentType.VIDEO}>
                    <div className="flex items-center gap-2">
                      <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                      {contentTypeLabels[CourseContentType.VIDEO]}
                    </div>
                  </SelectItem>
                  <SelectItem value={CourseContentType.TEXT}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      {contentTypeLabels[CourseContentType.TEXT]}
                    </div>
                  </SelectItem>
                  <SelectItem value={CourseContentType.PDF}>
                    <div className="flex items-center gap-2">
                      <File className="h-3 w-3 sm:h-4 sm:w-4" />
                      {contentTypeLabels[CourseContentType.PDF]}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {subSection.type === CourseContentType.TEXT ? (
            <Textarea
              value={subSection.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Contenu de la leçon texte..."
              className="border-emerald-200 dark:border-emerald-800 min-h-[120px] sm:min-h-[150px] text-sm"
            />
          ) : (
            <SubSectionDropzone
              subSection={subSection}
              onDrop={onFileDrop}
              onRemove={onRemoveFile}
              isUploading={isUploading}
              uploadStatus={uploadStatus}
              progress={progress}
              hasFile={!!subSection.fileUrl}
            />
          )}
        </div>
      )}
    </div>
  )
}

