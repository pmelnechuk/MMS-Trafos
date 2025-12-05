
import { createClient } from '@/lib/supabase/server'
import InspectionReport from './InspectionReport'

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: inspection } = await supabase
        .from('inspections')
        .select('*, transformers(*)')
        .eq('id', id)
        .single()

    if (!inspection) {
        return <div>Inspección no encontrada</div>
    }

    return <InspectionReport inspection={inspection} />
}
