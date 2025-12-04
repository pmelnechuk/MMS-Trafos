
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Trash2, Plus, Search } from 'lucide-react'
import Link from 'next/link'

interface MaintenanceDetailsProps {
    schedule: any
    assignedAssets: any[]
    availableAssets: any[]
}

export default function MaintenanceDetails({ schedule, assignedAssets, availableAssets }: MaintenanceDetailsProps) {
    const [loading, setLoading] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const [selectedAssetId, setSelectedAssetId] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleAssign = async () => {
        if (!selectedAssetId) return
        setAssigning(true)
        try {
            const { error } = await supabase
                .from('schedule_assignments')
                .insert([
                    {
                        schedule_id: schedule.id,
                        transformer_id: selectedAssetId
                    }
                ])

            if (error) throw error
            setSelectedAssetId('')
            router.refresh()
        } catch (error) {
            alert('Error al asignar activo')
            console.error(error)
        } finally {
            setAssigning(false)
        }
    }

    const handleUnassign = async (transformerId: string) => {
        if (!confirm('¿Estás seguro de quitar este activo del plan?')) return
        try {
            const { error } = await supabase
                .from('schedule_assignments')
                .delete()
                .match({ schedule_id: schedule.id, transformer_id: transformerId })

            if (error) throw error
            router.refresh()
        } catch (error) {
            alert('Error al desasignar activo')
            console.error(error)
        }
    }

    const handleDeleteSchedule = async () => {
        if (!confirm('¿Estás seguro de eliminar este plan de mantenimiento?')) return
        setLoading(true)
        try {
            const { error } = await supabase
                .from('maintenance_schedules')
                .delete()
                .eq('id', schedule.id)

            if (error) throw error
            router.push('/maintenance')
        } catch (error) {
            alert('Error al eliminar el plan')
            setLoading(false)
        }
    }

    // Filter available assets to exclude already assigned ones
    const filteredAvailable = availableAssets.filter(
        asset => !assignedAssets.some(assigned => assigned.transformer_id === asset.id)
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/maintenance" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{schedule.name}</h1>
                </div>
                <button
                    onClick={handleDeleteSchedule}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-lg bg-white shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles del Plan</h3>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Frecuencia</dt>
                                <dd className="mt-1 text-sm text-gray-900">{schedule.frequency_days} días</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Próximo Vencimiento Global</dt>
                                <dd className="mt-1 text-sm text-gray-900">{new Date(schedule.next_due_date).toLocaleDateString()}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-lg bg-white shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Asignar Activo</h3>
                        <div className="space-y-4">
                            <select
                                value={selectedAssetId}
                                onChange={(e) => setSelectedAssetId(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                <option value="">Seleccionar activo...</option>
                                {filteredAvailable.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.serial_number} - {asset.brand}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedAssetId || assigning}
                                className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                            >
                                {assigning ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                                Asignar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Assigned Assets List */}
                <div className="lg:col-span-2">
                    <div className="rounded-lg bg-white shadow overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Activos Asignados ({assignedAssets.length})
                            </h3>
                        </div>
                        <ul role="list" className="divide-y divide-gray-200">
                            {assignedAssets.map((item) => (
                                <li key={item.transformer_id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-indigo-600 truncate">
                                                    {item.transformers.serial_number}
                                                </p>
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {item.transformers.brand} - {item.transformers.power_kva} kVA
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.transformers.status === 'GREEN' ? 'bg-green-100 text-green-800' :
                                                    item.transformers.status === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {item.transformers.status}
                                            </span>
                                            <button
                                                onClick={() => handleUnassign(item.transformer_id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {assignedAssets.length === 0 && (
                                <li className="px-4 py-8 text-center text-sm text-gray-500">
                                    No hay activos asignados a este plan.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
