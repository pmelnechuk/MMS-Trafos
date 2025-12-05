
import { createClient } from '@/lib/supabase/server'
import { FileText, Download, Filter } from 'lucide-react'

export default async function ReportsPage() {
    const supabase = await createClient()

    const { data: inspections } = await supabase
        .from('inspections')
        .select('*, transformers(serial_number, brand)')
        .order('date', { ascending: false })
        .limit(50)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Reportes e Inspecciones</h1>
                <button className="flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </button>
            </div>

            <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
                <div className="border-b border-gray-200 px-4 py-5 sm:px-6 flex items-center justify-between">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Últimas Inspecciones</h3>
                    <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-gray-500">
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Fecha</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Activo</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Técnico</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {inspections?.map((inspection) => (
                                <tr key={inspection.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                                        {new Date(inspection.date).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div className="font-medium text-gray-900">{inspection.transformers?.serial_number}</div>
                                        <div className="text-gray-500">{inspection.transformers?.brand}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${inspection.overall_status === 'GREEN' ? 'bg-green-100 text-green-800' :
                                            inspection.overall_status === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {inspection.overall_status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        Técnico ID: {inspection.technician_id?.substring(0, 8)}...
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <a href={`/reports/${inspection.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1">
                                            <FileText className="h-4 w-4" /> Ver Detalles
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {(!inspections || inspections.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                                        No se encontraron inspecciones.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
