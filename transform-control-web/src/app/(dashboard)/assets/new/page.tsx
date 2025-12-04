
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'

export default function NewAssetPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        serial_number: '',
        brand: '',
        power_kva: '',
        year: '',
        oil_type: '',
        location_lat: '',
        location_lng: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Generate QR Code Content (e.g., JSON with minimal info)
            // We'll generate the image URL later or store the string content
            const qrContent = JSON.stringify({
                sn: formData.serial_number,
                type: 'transformer'
            })

            const qrDataUrl = await QRCode.toDataURL(qrContent)

            // Upload QR to storage (optional, or just store the content string)
            // For now, let's just store the content string in the DB 'qr_code' field
            // and we can render it on demand.

            const { error: insertError } = await supabase
                .from('transformers')
                .insert([
                    {
                        serial_number: formData.serial_number,
                        brand: formData.brand,
                        power_kva: parseFloat(formData.power_kva),
                        year: parseInt(formData.year),
                        oil_type: formData.oil_type,
                        location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
                        location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
                        qr_code: qrContent,
                        status: 'GREEN'
                    }
                ])

            if (insertError) throw insertError

            router.push('/assets')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error creating asset')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/assets" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Nuevo Transformador</h1>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">
                                Número de Serie *
                            </label>
                            <input
                                type="text"
                                name="serial_number"
                                id="serial_number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                value={formData.serial_number}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                                Marca
                            </label>
                            <input
                                type="text"
                                name="brand"
                                id="brand"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                value={formData.brand}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="power_kva" className="block text-sm font-medium text-gray-700">
                                Potencia (kVA)
                            </label>
                            <input
                                type="number"
                                name="power_kva"
                                id="power_kva"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                value={formData.power_kva}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                                Año de Fabricación
                            </label>
                            <input
                                type="number"
                                name="year"
                                id="year"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                value={formData.year}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="oil_type" className="block text-sm font-medium text-gray-700">
                                Tipo de Aceite
                            </label>
                            <select
                                name="oil_type"
                                id="oil_type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                value={formData.oil_type}
                                onChange={handleChange}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Mineral">Mineral</option>
                                <option value="Vegetal">Vegetal</option>
                                <option value="Silicona">Silicona</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900">Ubicación (Opcional)</h3>
                        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="location_lat" className="block text-sm font-medium text-gray-700">
                                    Latitud
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    name="location_lat"
                                    id="location_lat"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={formData.location_lat}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="location_lng" className="block text-sm font-medium text-gray-700">
                                    Longitud
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    name="location_lng"
                                    id="location_lng"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={formData.location_lng}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Link
                            href="/assets"
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Guardar Activo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
