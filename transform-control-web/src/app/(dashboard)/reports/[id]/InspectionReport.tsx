
'use client'

import { useRef } from 'react'
import { FileText, Download, ArrowLeft, Calendar, User, CheckCircle, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface InspectionReportProps {
    inspection: any
}

export default function InspectionReport({ inspection }: InspectionReportProps) {
    const router = useRouter()
    const data = typeof inspection.data === 'string' ? JSON.parse(inspection.data) : inspection.data

    const generatePDF = () => {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(20)
        doc.text('Reporte de Inspección', 14, 22)

        doc.setFontSize(10)
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30)

        // Asset Info
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Información del Activo', 14, 45)

        autoTable(doc, {
            startY: 50,
            head: [['Serial', 'Marca', 'Modelo', 'Potencia']],
            body: [[
                inspection.transformers.serial_number,
                inspection.transformers.brand,
                inspection.transformers.model,
                `${inspection.transformers.power_kva} kVA`
            ]],
        })

        // Inspection Info
        doc.text('Detalles de Inspección', 14, (doc as any).lastAutoTable.finalY + 15)

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Fecha', 'Técnico', 'Estado Global']],
            body: [[
                new Date(inspection.date).toLocaleDateString(),
                inspection.technician_id || 'N/A',
                inspection.overall_status
            ]],
        })

        // Checklist
        doc.text('Resultados de Verificación', 14, (doc as any).lastAutoTable.finalY + 15)

        const checklistData = Object.entries(data).map(([key, value]) => {
            return [key, value === true ? 'Conforme' : value === false ? 'No Conforme' : value]
        })

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Punto de Control', 'Resultado']],
            body: checklistData as any[],
            styles: { cellWidth: 'wrap' },
            columnStyles: { 0: { cellWidth: 100 } }
        })

        doc.save(`reporte_${inspection.transformers.serial_number}_${inspection.date.split('T')[0]}.pdf`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-500" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Detalle de Inspección</h1>
                </div>
                <button
                    onClick={generatePDF}
                    className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Asset Card */}
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Activo Inspeccionado</h3>
                    <dl className="divide-y divide-gray-100">
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-gray-900">Serial</dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{inspection.transformers.serial_number}</dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-gray-900">Marca/Modelo</dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{inspection.transformers.brand} - {inspection.transformers.model}</dd>
                        </div>
                    </dl>
                </div>

                {/* Status Card */}
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Estado General</h3>
                    <div className={`flex items-center gap-2 p-4 rounded-md ${inspection.overall_status === 'GREEN' ? 'bg-green-50 text-green-700' :
                        inspection.overall_status === 'YELLOW' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {inspection.overall_status === 'GREEN' ? <CheckCircle className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                        <div>
                            <p className="font-bold">Estado: {inspection.overall_status}</p>
                            <p className="text-sm">Fecha: {new Date(inspection.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Results */}
            <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
                <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Resultados del Checklist</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {Object.entries(data).map(([key, value]) => (
                            <li key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 truncate mr-2" title={key}>{key}</span>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === true ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                    value === false ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                        'bg-gray-50 text-gray-600 ring-gray-500/10'
                                    }`}>
                                    {value === true ? 'Conforme' : value === false ? 'No Conforme' : String(value)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
