
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft, Settings, Activity, FileText } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import AssetHistory from './AssetHistory'

interface Question {
    id: string
    text: string
    type: string
    category: string
}

interface Template {
    id: string
    name: string
    questions: Question[]
}

interface AssetDetailsProps {
    transformer: any
    templates: Template[]
    currentConfig: any
    inspections: any[]
}

export default function AssetDetails({ transformer, templates, currentConfig, inspections }: AssetDetailsProps) {
    const [activeTab, setActiveTab] = useState('info')
    const [loading, setLoading] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    // Config State
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(currentConfig?.template_id || '')
    const [enabledQuestions, setEnabledQuestions] = useState<string[]>(
        currentConfig?.enabled_questions || []
    )

    useEffect(() => {
        // Generate QR for display
        if (transformer.qr_code) {
            QRCode.toDataURL(transformer.qr_code).then(setQrCodeUrl)
        }
    }, [transformer])

    // When template changes, reset enabled questions to all questions of that template (if not loading existing config)
    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId)
        if (templateId === currentConfig?.template_id) {
            setEnabledQuestions(currentConfig.enabled_questions)
        } else {
            const template = templates.find(t => t.id === templateId)
            if (template) {
                setEnabledQuestions(template.questions.map(q => q.id))
            }
        }
    }

    const toggleQuestion = (questionId: string) => {
        setEnabledQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        )
    }

    const saveConfiguration = async () => {
        setLoading(true)
        try {
            const payload = {
                transformer_id: transformer.id,
                template_id: selectedTemplateId,
                enabled_questions: enabledQuestions,
                updated_at: new Date().toISOString()
            }

            if (currentConfig?.id) {
                await supabase
                    .from('transformer_form_config')
                    .update(payload)
                    .eq('id', currentConfig.id)
            } else {
                await supabase
                    .from('transformer_form_config')
                    .insert([payload])
            }

            router.refresh()
            alert('Configuración guardada correctamente')
        } catch (error) {
            console.error(error)
            alert('Error al guardar la configuración')
        } finally {
            setLoading(false)
        }
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/assets" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{transformer.serial_number}</h1>
                        <p className="text-sm text-gray-500">{transformer.brand} - {transformer.power_kva} kVA</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${transformer.status === 'GREEN' ? 'bg-green-100 text-green-800' :
                        transformer.status === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {transformer.status}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`${activeTab === 'info'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <Activity className="h-4 w-4" />
                        Información General
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`${activeTab === 'config'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <Settings className="h-4 w-4" />
                        Configuración de Inspección
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`${activeTab === 'history'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <FileText className="h-4 w-4" />
                        Historial
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Datos Técnicos</h3>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Año de Fabricación</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{transformer.year}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Tipo de Aceite</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{transformer.oil_type}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {transformer.location_lat && transformer.location_lng
                                                ? `${transformer.location_lat}, ${transformer.location_lng}`
                                                : 'No registrada'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow flex flex-col items-center justify-center p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Código QR</h3>
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
                            ) : (
                                <div className="h-48 w-48 bg-gray-100 animate-pulse rounded" />
                            )}
                            <p className="mt-2 text-xs text-gray-500 font-mono">{transformer.id}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="space-y-6">
                        <div className="rounded-lg bg-white shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Asignación de Plantilla</h3>
                            <div className="max-w-xl">
                                <label className="block text-sm font-medium text-gray-700">Plantilla Maestra</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={selectedTemplateId}
                                    onChange={(e) => handleTemplateChange(e.target.value)}
                                >
                                    <option value="">Seleccionar plantilla...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <p className="mt-2 text-sm text-gray-500">
                                    Selecciona la plantilla base que se utilizará para las inspecciones de este equipo.
                                </p>
                            </div>
                        </div>

                        {selectedTemplate && (
                            <div className="rounded-lg bg-white shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Personalización de Preguntas</h3>
                                    <span className="text-sm text-gray-500">
                                        {enabledQuestions.length} preguntas activas
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {selectedTemplate.questions.map((q) => (
                                        <div key={q.id} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0">
                                            <div className="flex h-5 items-center">
                                                <input
                                                    id={`question-${q.id}`}
                                                    name={`question-${q.id}`}
                                                    type="checkbox"
                                                    checked={enabledQuestions.includes(q.id)}
                                                    onChange={() => toggleQuestion(q.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="text-sm">
                                                <label htmlFor={`question-${q.id}`} className="font-medium text-gray-700">
                                                    {q.text}
                                                </label>
                                                <p className="text-gray-500 text-xs">
                                                    {q.category} • {q.type}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={saveConfiguration}
                                        disabled={loading}
                                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Guardar Configuración
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <AssetHistory inspections={inspections} />
                )}
            </div>
        </div>
    )
}
