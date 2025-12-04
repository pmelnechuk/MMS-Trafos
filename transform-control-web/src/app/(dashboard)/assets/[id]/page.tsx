
import { createClient } from '@/lib/supabase/server'
import AssetDetails from './AssetDetails'

export default async function AssetPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = params

    // Fetch Transformer
    const { data: transformer } = await supabase
        .from('transformers')
        .select('*')
        .eq('id', id)
        .single()

    // Fetch Templates
    const { data: templates } = await supabase
        .from('form_templates')
        .select('*')
        .order('name')

    // Fetch Current Config
    const { data: config } = await supabase
        .from('transformer_form_config')
        .select('*')
        .eq('transformer_id', id)
        .single()

    if (!transformer) {
        return <div>Activo no encontrado</div>
    }

    return (
        <AssetDetails
            transformer={transformer}
            templates={templates || []}
            currentConfig={config}
        />
    )
}
