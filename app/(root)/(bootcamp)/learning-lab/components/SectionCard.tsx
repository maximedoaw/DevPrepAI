'use client'

import React from 'react'
import { ChevronRight, Trash2, BookOpen, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Section, SubSection, CourseContentType } from './types'
import { SubSectionCard } from './SubSectionCard'

interface SectionCardProps {
  section: Section
  index: number
  isExpanded: boolean
  isEditing: boolean
  expandedSubSections: Set<string>
  editingSubSectionId: string | null
  uploadingSubSectionId: string | null
  uploadProgress: Record<string, number>
  uploadStatus: Record<string, 'uploading' | 'success' | 'error'>
  onToggleExpand: () => void
  onEdit: () => void
  onUpdate: (updates: Partial<Section>) => void
  onDelete: () => void
  onToggleSubSectionExpand: (subSectionId: string) => void
  onEditSubSection: (subSectionId: string) => void
  onUpdateSubSection: (subSectionId: string, updates: Partial<SubSection>) => void
  onDeleteSubSection: (subSectionId: string) => void
  onSubSectionFileDrop: (subSectionId: string, acceptedFiles: File[], rejectedFiles: any[]) => void
  onRemoveSubSectionFile?: (subSectionId: string) => void
  onAddSubSection: () => void
}

export function SectionCard({
  section,
  index,
  isExpanded,
  isEditing,
  expandedSubSections,
  editingSubSectionId,
  uploadingSubSectionId,
  uploadProgress,
  uploadStatus,
  onToggleExpand,
  onEdit,
  onUpdate,
  onDelete,
  onToggleSubSectionExpand,
  onEditSubSection,
  onUpdateSubSection,
  onDeleteSubSection,
  onSubSectionFileDrop,
  onRemoveSubSectionFile,
  onAddSubSection
}: SectionCardProps) {
  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleExpand}
              className="h-8 w-8"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  value={section.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="border-emerald-200 dark:border-emerald-800"
                  onBlur={() => {}}
                  autoFocus
                />
              ) : (
                <CardTitle 
                  className="text-base cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                  onClick={onEdit}
                >
                  {section.title}
                </CardTitle>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                >
                  {section.subSections.length} leçon{section.subSections.length > 1 ? 's' : ''}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Chapitre {index + 1}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {section.subSections.length} leçon{section.subSections.length > 1 ? 's' : ''}
            </span>
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
          {section.subSections.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p className="mb-2">Aucune leçon</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddSubSection}
                className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter la première leçon
              </Button>
            </div>
          ) : (
            section.subSections.map((subSection, subIndex) => (
              <SubSectionCard
                key={subSection.id}
                subSection={subSection}
                sectionId={section.id}
                subIndex={subIndex}
                isExpanded={expandedSubSections.has(subSection.id)}
                isEditing={editingSubSectionId === subSection.id}
                isUploading={uploadingSubSectionId === subSection.id}
                uploadStatus={uploadStatus[subSection.id]}
                progress={uploadProgress[subSection.id] || 0}
                onToggleExpand={() => onToggleSubSectionExpand(subSection.id)}
                onEdit={() => onEditSubSection(subSection.id)}
                onUpdate={(updates) => onUpdateSubSection(subSection.id, updates)}
                onDelete={() => onDeleteSubSection(subSection.id)}
                onFileDrop={(acceptedFiles, rejectedFiles) => onSubSectionFileDrop(subSection.id, acceptedFiles, rejectedFiles)}
                onRemoveFile={onRemoveSubSectionFile ? () => onRemoveSubSectionFile(subSection.id) : undefined}
              />
            ))
          )}
        </CardContent>
      )}
    </Card>
  )
}

