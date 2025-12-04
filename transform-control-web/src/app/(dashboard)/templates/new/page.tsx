
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface Question {
    id: string
    text: string
    type: 'CHECK' | 'TEXT' | 'NUMBER'
    category: string
}

export default function NewTemplatePage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [questions, setQuestions] = useState<Question[]>([])

    const addQuestion = () => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            text: '',
            type: 'CHECK',
            category: 'General'
        }
        setQuestions([...questions, newQuestion])
    }

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const updateQuestion = (id: string, field: keyof Question, value: string) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: insertError } = await supabase
                .from('form_templates')
                .insert([
                    {
                        name,
                        description,
                        questions: questions
                    }
                ])

            if (insertError) throw insertError

            router.push('/templates')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error creating template')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/templates" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Nueva Plantilla</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nombre de la Plantilla *
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Inspección Mensual Estándar"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción breve del propósito de esta plantilla..."
                        />
                    </div>
                </div>

                {/* Questions Builder */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Preguntas de Inspección</h2>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Pregunta
                        </button>
                    </div>

                    <div className="space-y-3">
                        {questions.map((q, index) => (
                            <div key={q.id} className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                                <div className="mt-2 cursor-move text-gray-400">
                                    <GripVertical className="h-5 w-5" />
                                </div>
                                <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-12">
                                    <div className="sm:col-span-6">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Pregunta</label>
                                        <input
                                            type="text"
                                            value={q.text}
                                            onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                            placeholder="Ej: ¿Nivel de aceite correcto?"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
                                        <input
                                            type="text"
                                            value={q.category}
                                            onChange={(e) => updateQuestion(q.id, 'category', e.target.value)}
                                            placeholder="Ej: General"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                        <select
                                            value={q.type}
                                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value as any)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        >
                                            <option value="CHECK">Verificación (OK/NO OK)</option>
                                            <option value="TEXT">Texto Libre</option>
                                            <option value="NUMBER">Numérico</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(q.id)}
                                    className="mt-2 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}

                        {questions.length === 0 && (
                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                                <p className="text-gray-500">No hay preguntas definidas.</p>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Agregar la primera pregunta
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                    <Link
                        href="/templates"
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Guardar Plantilla
                    </button>
                </div>
            </form>
        </div>
    )
}
