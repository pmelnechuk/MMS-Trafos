
import { createClient } from '@/lib/supabase/server'
import { Activity, AlertTriangle, CheckCircle, Box } from 'lucide-react'

// Temporary simple card component until we set up shadcn/ui or similar
function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-full p-3 ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    )
}

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch stats (mock for now or real if we had data)
    const { count: totalTransformers } = await supabase
        .from('transformers')
        .select('*', { count: 'exact', head: true })

    const { count: criticalAlerts } = await supabase
        .from('transformers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'RED')

    const { count: operational } = await supabase
        .from('transformers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'GREEN')

    // Fetch recent inspections
    const { data: recentInspections } = await supabase
        .from('inspections')
        .select('*, transformers(serial_number)')
        .order('date', { ascending: false })
        .limit(5)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Activos"
                    value={totalTransformers || 0}
                    icon={Box}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Operativos"
                    value={operational || 0}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="Alertas Críticas"
                    value={criticalAlerts || 0}
                    icon={AlertTriangle}
                    color="bg-red-500"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">Mapa de Estado</h2>
                    <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100 border-2 border-dashed border-gray-300">
                        <p className="text-gray-500">Mapa interactivo (Próximamente)</p>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-gray-500" />
                        Actividad Reciente
                    </h2>
                    <div className="flow-root">
                        <ul role="list" className="-mb-8">
                            {recentInspections?.map((inspection, eventIdx) => (
                                <li key={inspection.id}>
                                    <div className="relative pb-8">
                                        {eventIdx !== recentInspections.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${inspection.overall_status === 'GREEN' ? 'bg-green-500' :
                                                        inspection.overall_status === 'YELLOW' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}>
                                                    <Activity className="h-5 w-5 text-white" aria-hidden="true" />
                                                </span>
                                            </div>
                                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Inspección de <span className="font-medium text-gray-900">{inspection.transformers?.serial_number}</span>
                                                    </p>
                                                </div>
                                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                                    <time dateTime={inspection.date}>{new Date(inspection.date).toLocaleDateString()}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {(!recentInspections || recentInspections.length === 0) && (
                                <li className="py-4 text-center text-sm text-gray-500">No hay actividad reciente</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}


