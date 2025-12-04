
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileText, Edit, Trash2 } from 'lucide-react'

export default async function TemplatesPage() {
    const supabase = await createClient()

    const { data: templates } = await supabase
        .from('form_templates')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Plantillas de Inspección</h1>
                <Link
                    href="/templates/new"
                    className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Plantilla
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates?.map((template) => (
                    <div
                        key={template.id}
                        className="relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                        <div className="p-6 flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="rounded-lg bg-indigo-50 p-2">
                                    <FileText className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-3">
                                {template.description || 'Sin descripción'}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                <span>{Array.isArray(template.questions) ? template.questions.length : 0} preguntas</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3">
                            <Link
                                href={`/templates/${template.id}/edit`}
                                className="text-gray-600 hover:text-indigo-600"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
                            <button className="text-gray-600 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {(!templates || templates.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay plantillas</h3>
                        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva plantilla maestra.</p>
                        <div className="mt-6">
                            <Link
                                href="/templates/new"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                Nueva Plantilla
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
