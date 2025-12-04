
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

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Mapa de Estado</h2>
                <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100 border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">Mapa interactivo (Próximamente)</p>
                </div>
            </div>
        </div>
    )
}


