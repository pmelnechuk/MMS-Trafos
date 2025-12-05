
import { createClient } from '@/lib/supabase/server'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

export default async function CalendarPage() {
    const supabase = await createClient()

    // Fetch schedules
    const { data: schedules } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .order('next_due_date', { ascending: true })

    // Simple grouping by month for the "Calendar" view
    // A full interactive calendar is complex, so we'll do a "Agenda View" which is often more useful
    const groupedSchedules: Record<string, any[]> = {}

    schedules?.forEach(schedule => {
        if (!schedule.next_due_date) return
        const date = new Date(schedule.next_due_date)
        const key = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
        if (!groupedSchedules[key]) groupedSchedules[key] = []
        groupedSchedules[key].push(schedule)
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Calendario de Mantenimiento</h1>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <span className="text-sm font-medium text-gray-700">Vista Agenda</span>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {Object.entries(groupedSchedules).map(([month, items]) => (
                    <div key={month} className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900 capitalize">{month}</h3>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {items.map((item: any) => (
                                <li key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">Frecuencia: {item.frequency_days} días</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-indigo-600">
                                                {new Date(item.next_due_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400">Vencimiento</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {Object.keys(groupedSchedules).length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay mantenimientos programados</h3>
                        <p className="mt-1 text-sm text-gray-500">Crea nuevos planes de mantenimiento para verlos aquí.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
