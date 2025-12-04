
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, QrCode, Eye } from 'lucide-react'

export default async function AssetsPage() {
    const supabase = await createClient()

    const { data: transformers, error } = await supabase
        .from('transformers')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Activos</h1>
                <Link
                    href="/assets/new"
                    className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Transformador
                </Link>
            </div>

            <div className="rounded-lg bg-white shadow-sm">
                <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                    <div className="relative rounded-md shadow-sm max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            id="search"
                            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Buscar por serie, marca..."
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Nº Serie
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Marca
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Potencia (kVA)
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Año
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Estado
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {transformers?.map((t) => (
                                <tr key={t.id}>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                        {t.serial_number}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {t.brand}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {t.power_kva}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {t.year}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${t.status === 'GREEN'
                                                    ? 'bg-green-100 text-green-800'
                                                    : t.status === 'YELLOW'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/assets/${t.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button className="text-gray-600 hover:text-gray-900">
                                                <QrCode className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!transformers || transformers.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
                                        No hay transformadores registrados.
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
