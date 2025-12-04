
'use client'

import { FileText, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'

interface AssetHistoryProps {
    inspections: any[]
}

export default function AssetHistory({ inspections }: AssetHistoryProps) {
    return (
        <div className="space-y-6">
            <div className="flow-root">
                <ul role="list" className="-mb-8">
                    {inspections.map((inspection, eventIdx) => (
                        <li key={inspection.id}>
                            <div className="relative pb-8">
                                {eventIdx !== inspections.length - 1 ? (
                                    <span
                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span
                                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${inspection.overall_status === 'GREEN'
                                                    ? 'bg-green-500'
                                                    : inspection.overall_status === 'YELLOW'
                                                        ? 'bg-yellow-500'
                                                        : 'bg-red-500'
                                                }`}
                                        >
                                            {inspection.overall_status === 'GREEN' ? (
                                                <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-white" aria-hidden="true" />
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Inspección realizada por <span className="font-medium text-gray-900">Técnico</span>
                                            </p>
                                            {inspection.pdf_url && (
                                                <a href={inspection.pdf_url} target="_blank" rel="noreferrer" className="mt-2 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                                    <FileText className="mr-1 h-4 w-4" />
                                                    Ver Reporte PDF
                                                </a>
                                            )}
                                        </div>
                                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                            <time dateTime={inspection.date}>
                                                {new Date(inspection.date).toLocaleDateString()}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}

                    {inspections.length === 0 && (
                        <div className="text-center py-12">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin historial</h3>
                            <p className="mt-1 text-sm text-gray-500">No hay registros de inspecciones para este activo.</p>
                        </div>
                    )}
                </ul>
            </div>
        </div>
    )
}
