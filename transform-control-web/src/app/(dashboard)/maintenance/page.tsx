
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Calendar, Clock, Users } from 'lucide-react'

export default async function MaintenancePage() {
    const supabase = await createClient()

    const { data: schedules } = await supabase
        .from('maintenance_schedules')
        .select('*, schedule_assignments(count)')
        .order('next_due_date', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Programación de Mantenimiento</h1>
                <Link
                    href="/maintenance/new"
                    className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Plan
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {schedules?.map((schedule) => (
                    <div
                        key={schedule.id}
                        className="relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                        <div className="p-6 flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="rounded-lg bg-orange-50 p-2">
                                    <Calendar className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">{schedule.name}</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    <span>Frecuencia: {schedule.frequency_days} días</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                    <span>Próximo: {new Date(schedule.next_due_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Users className="mr-2 h-4 w-4 text-gray-400" />
                                    <span>
                                        {schedule.schedule_assignments?.[0]?.count || 0} activos asignados
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3">
                            <Link
                                href={`/maintenance/${schedule.id}`}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Ver detalles &rarr;
                            </Link>
                        </div>
                    </div>
                ))}

                {(!schedules || schedules.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay mantenimientos programados</h3>
                        <p className="mt-1 text-sm text-gray-500">Crea un plan de mantenimiento para comenzar.</p>
                        <div className="mt-6">
                            <Link
                                href="/maintenance/new"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                Nuevo Plan
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
