'use client'

import { useActionState, useState } from 'react'
import { updateCategoryAction, type CategoryActionState } from '@/app/admin/categories/actions'
import { Button } from '@/components/ui/button'

const initialState: CategoryActionState = {}

export function CategoryEditForm(props: {
  id: string
  name: string
  summary?: string | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  sections?: string | null
  uiConfig?: string | null
}) {
  const [state, action, pending] = useActionState<CategoryActionState, FormData>(
    updateCategoryAction,
    initialState
  )
  const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'sections'>('basic')

  // Parse JSON fields
  let sectionsData = [
    { title: '', description: '', image: { url: '', alt: '' } },
    { title: '', description: '', image: { url: '', alt: '' } },
    { title: '', description: '', image: { url: '', alt: '' } },
  ]

  try {
    if (props.sections) {
      const parsed = JSON.parse(props.sections)
      if (Array.isArray(parsed)) sectionsData = parsed
    }
  } catch (e) {
    console.error('Failed to parse sections')
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'basic'
              ? 'border-amber-700 text-amber-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Basic Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'seo'
              ? 'border-amber-700 text-amber-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          SEO
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'sections'
              ? 'border-amber-700 text-amber-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Content Sections
        </button>
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={props.id} />

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Name</label>
              <input
                name="name"
                defaultValue={props.name}
                required
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Summary</label>
              <textarea
                name="summary"
                defaultValue={props.summary ?? ''}
                rows={3}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Replace image (optional)</label>
              <input name="featuredImageFile" type="file" accept="image/*" />
              {props.featuredImageUrl && (
                <p className="text-xs text-muted-foreground break-all">Current: {props.featuredImageUrl}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Alt text</label>
              <input
                name="featuredImageAlt"
                defaultValue={props.featuredImageAlt ?? ''}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">SEO Title</label>
              <input
                name="seoTitle"
                defaultValue={props.seoTitle ?? ''}
                placeholder={`${props.name} | Khyber Shawls`}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500">Leave empty to use default: "{props.name} | Khyber Shawls"</p>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">SEO Description</label>
              <textarea
                name="seoDescription"
                defaultValue={props.seoDescription ?? ''}
                rows={3}
                placeholder="Shop our collection of..."
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500">Recommended: 150-160 characters</p>
            </div>
          </div>
        )}

        {/* Content Sections Tab */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">These 3 sections appear below the products grid. Leave fields empty to hide a section.</p>
            
            {[0, 1, 2].map((index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                <h4 className="font-medium text-sm">Section {index + 1}</h4>
                
                <div className="grid gap-1.5">
                  <label className="text-sm">Title</label>
                  <input
                    name={`section${index}Title`}
                    defaultValue={sectionsData[index]?.title || ''}
                    placeholder="Heritage & Craftsmanship"
                    className="rounded-md border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label className="text-sm">Description</label>
                  <textarea
                    name={`section${index}Description`}
                    defaultValue={sectionsData[index]?.description || ''}
                    rows={3}
                    placeholder="Each piece tells a story..."
                    className="rounded-md border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label className="text-sm">Image</label>
                  <input
                    name={`section${index}ImageFile`}
                    type="file"
                    accept="image/*"
                    className="rounded-md border bg-white px-3 py-2 text-sm"
                  />
                  {sectionsData[index]?.image?.url && (
                    <p className="text-xs text-muted-foreground">Current: {sectionsData[index].image.url}</p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <label className="text-sm">Image Alt Text</label>
                  <input
                    name={`section${index}ImageAlt`}
                    defaultValue={sectionsData[index]?.image?.alt || ''}
                    placeholder="Artisan weaving shawl"
                    className="rounded-md border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.success && <p className="text-sm text-primary">{state.success}</p>}

        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  )
}
