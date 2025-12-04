
import { createClient } from '@/lib/supabase/server'
import MaintenanceDetails from './MaintenanceDetails'

export default async function MaintenanceDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = params

    // Fetch Schedule
    const { data: schedule } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('id', id)
        .single()

    // Fetch Assigned Assets
    // We need to join with transformers to get details
    const { data: assignedAssets } = await supabase
        .from('schedule_assignments')
        .select('transformer_id, transformers(*)')
        .eq('schedule_id', id)

    // Fetch All Assets (for selection)
    const { data: availableAssets } = await supabase
        .from('transformers')
        .select('id, serial_number, brand, power_kva')
        .order('serial_number')

    if (!schedule) {
        return <div>Plan no encontrado</div>
    }

    return (
        <MaintenanceDetails
            schedule={schedule}
            assignedAssets={assignedAssets || []}
            availableAssets={availableAssets || []}
        />
    )
}
