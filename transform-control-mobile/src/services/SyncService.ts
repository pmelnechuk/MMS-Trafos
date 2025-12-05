
import { supabase } from '../lib/supabase';
import { getDB } from '../lib/db';

export const SyncService = {
    async syncTransformers() {
        try {
            const { data, error } = await supabase
                .from('transformers')
                .select('*');

            if (error) throw error;

            const db = await getDB();

            // Use transaction for bulk insert/update
            await db.withTransactionAsync(async () => {
                for (const t of data) {
                    await db.runAsync(
                        `INSERT OR REPLACE INTO transformers (id, serial_number, brand, model, power_kva, status, qr_code, location_lat, location_lng, last_synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            t.id,
                            t.serial_number,
                            t.brand,
                            t.model,
                            t.power_kva,
                            t.status,
                            t.qr_code,
                            t.location_lat,
                            t.location_lng,
                            new Date().toISOString()
                        ]
                    );
                }
            });

            console.log(`Synced ${data.length} transformers`);
            return { success: true, count: data.length };
        } catch (error) {
            console.error('Sync Transformers Error:', error);
            return { success: false, error };
        }
    },

    async syncTemplates() {
        try {
            // 1. Templates
            const { data: templates, error: tempError } = await supabase
                .from('form_templates')
                .select('*');

            if (tempError) throw tempError;

            const db = await getDB();

            await db.withTransactionAsync(async () => {
                for (const t of templates) {
                    await db.runAsync(
                        `INSERT OR REPLACE INTO form_templates (id, name, description, questions_json, created_at)
             VALUES (?, ?, ?, ?, ?)`,
                        [t.id, t.name, t.description, JSON.stringify(t.questions), t.created_at]
                    );
                }
            });

            // 2. Configs
            const { data: configs, error: confError } = await supabase
                .from('transformer_form_config')
                .select('*');

            if (confError) throw confError;

            await db.withTransactionAsync(async () => {
                for (const c of configs) {
                    await db.runAsync(
                        `INSERT OR REPLACE INTO transformer_form_config (id, transformer_id, template_id, enabled_questions_json, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
                        [c.id, c.transformer_id, c.template_id, JSON.stringify(c.enabled_questions), c.updated_at]
                    );
                }
            });

            console.log('Synced templates and configs');
            return { success: true };
        } catch (error) {
            console.error('Sync Templates Error:', error);
            return { success: false, error };
        }
    },

    async uploadInspections() {
        try {
            const db = await getDB();
            const unsynced = await db.getAllAsync('SELECT * FROM inspections WHERE synced = 0');

            if (unsynced.length === 0) return { success: true, count: 0 };

            for (const inspection of unsynced as any[]) {
                const data = JSON.parse(inspection.data_json);
                const photos = data._photos || {};
                const uploadedPhotos: Record<string, string> = {};

                // Upload photos if any
                for (const [questionId, uri] of Object.entries(photos)) {
                    if (typeof uri === 'string' && (uri as string).startsWith('file://')) {
                        try {
                            const filename = `${inspection.id}/${questionId}_${Date.now()}.jpg`;
                            const formData = new FormData();
                            formData.append('file', {
                                uri,
                                name: filename,
                                type: 'image/jpeg',
                            } as any);

                            const { data: uploadData, error: uploadError } = await supabase.storage
                                .from('inspection-images')
                                .upload(filename, formData as any);

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage
                                .from('inspection-images')
                                .getPublicUrl(filename);

                            uploadedPhotos[questionId] = publicUrl;
                        } catch (e) {
                            console.error('Error uploading photo:', e);
                            // Keep local URI if failed? Or mark as failed? 
                            // For now, skip this photo
                        }
                    }
                }

                // Update data with public URLs
                const finalData = {
                    ...data,
                    _photos: uploadedPhotos
                };

                const { error } = await supabase
                    .from('inspections')
                    .insert({
                        id: inspection.id,
                        transformer_id: inspection.transformer_id,
                        technician_id: inspection.technician_id,
                        date: inspection.date,
                        overall_status: inspection.overall_status,
                        data: finalData
                    });

                if (!error) {
                    await db.runAsync('UPDATE inspections SET synced = 1 WHERE id = ?', [inspection.id]);
                } else {
                    console.error('Failed to upload inspection:', inspection.id, error);
                }
            }

            return { success: true, count: unsynced.length };
        } catch (error) {
            console.error('Upload Inspections Error:', error);
            return { success: false, error };
        }
    }
};
