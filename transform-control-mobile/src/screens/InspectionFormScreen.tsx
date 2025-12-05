
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDB } from '../lib/db';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';

interface Question {
    id: string;
    text: string;
    type: 'boolean' | 'text' | 'select';
    category: string;
}

export default function InspectionFormScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { transformerId } = route.params;

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);

    // State
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [photos, setPhotos] = useState<Record<string, string>>({});
    const [comments, setComments] = useState<Record<string, string>>({});
    const [severity, setSeverity] = useState<Record<string, 'Leve' | 'Grave' | 'Crítica'>>({});

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadForm();
    }, []);

    const loadForm = async () => {
        try {
            const db = await getDB();

            const config = await db.getFirstAsync(
                'SELECT * FROM transformer_form_config WHERE transformer_id = ?',
                [transformerId]
            ) as any;

            if (!config) {
                Alert.alert('Error', 'No hay configuración de inspección para este activo. Sincronice primero.');
                navigation.goBack();
                return;
            }

            const template = await db.getFirstAsync(
                'SELECT * FROM form_templates WHERE id = ?',
                [config.template_id]
            ) as any;

            if (!template) {
                Alert.alert('Error', 'Plantilla no encontrada. Sincronice primero.');
                navigation.goBack();
                return;
            }

            const allQuestions = JSON.parse(template.questions_json);
            const enabledIds = JSON.parse(config.enabled_questions_json);

            const filtered = allQuestions.filter((q: Question) => enabledIds.includes(q.id));
            setQuestions(filtered);

            const initialAnswers: any = {};
            filtered.forEach((q: Question) => {
                initialAnswers[q.id] = q.type === 'boolean' ? true : '';
            });
            setAnswers(initialAnswers);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Error al cargar el formulario');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (id: string, value: any) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const takePhoto = async (questionId: string) => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permiso requerido", "Se necesita acceso a la cámara para tomar fotos.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhotos(prev => ({ ...prev, [questionId]: result.assets[0].uri }));
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const db = await getDB();
            const inspectionId = Crypto.randomUUID();
            const date = new Date().toISOString();

            let status = 'GREEN';
            const hasFailures = questions.some(q => q.type === 'boolean' && answers[q.id] === false);
            if (hasFailures) status = 'YELLOW';
            // If any severity is 'Crítica', status is RED
            if (Object.values(severity).includes('Crítica')) status = 'RED';

            const dataToSave = {
                ...answers,
                _photos: photos,
                _comments: comments,
                _severity: severity
            };

            await db.runAsync(
                `INSERT INTO inspections (id, transformer_id, technician_id, date, overall_status, data_json, synced, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
                [
                    inspectionId,
                    transformerId,
                    'offline-user',
                    date,
                    status,
                    JSON.stringify(dataToSave),
                    date
                ]
            );

            Alert.alert('Éxito', 'Inspección guardada localmente', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo guardar la inspección');
        } finally {
            setSaving(false);
        }
    };

    const SeverityButton = ({ qId, level, current, onSelect }: any) => (
        <TouchableOpacity
            onPress={() => onSelect(level)}
            style={[
                styles.severityBtn,
                current === level && (level === 'Leve' ? styles.sevLeve : level === 'Grave' ? styles.sevGrave : styles.sevCritica)
            ]}
        >
            <Text style={[styles.severityText, current === level && styles.severityTextSelected]}>{level}</Text>
        </TouchableOpacity>
    );

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Nueva Inspección</Text>

            {questions.map((q) => (
                <View key={q.id} style={styles.questionCard}>
                    <Text style={styles.questionText}>{q.text}</Text>
                    <Text style={styles.categoryText}>{q.category}</Text>

                    {q.type === 'boolean' ? (
                        <View>
                            <View style={styles.switchRow}>
                                <Text style={answers[q.id] ? styles.okText : styles.failText}>
                                    {answers[q.id] ? 'Conforme' : 'No Conforme'}
                                </Text>
                                <Switch
                                    value={answers[q.id]}
                                    onValueChange={(val) => handleAnswerChange(q.id, val)}
                                    trackColor={{ false: '#ef4444', true: '#22c55e' }}
                                    thumbColor={answers[q.id] ? '#fff' : '#fff'}
                                />
                            </View>

                            {/* Anomaly Section: Show if False */}
                            {!answers[q.id] && (
                                <View style={styles.anomalyContainer}>
                                    <Text style={styles.label}>Severidad:</Text>
                                    <View style={styles.severityRow}>
                                        {['Leve', 'Grave', 'Crítica'].map((level) => (
                                            <SeverityButton
                                                key={level}
                                                qId={q.id}
                                                level={level}
                                                current={severity[q.id]}
                                                onSelect={(l: any) => setSeverity(prev => ({ ...prev, [q.id]: l }))}
                                            />
                                        ))}
                                    </View>

                                    <Text style={styles.label}>Comentarios:</Text>
                                    <TextInput
                                        style={styles.inputSmall}
                                        value={comments[q.id] || ''}
                                        onChangeText={(text) => setComments(prev => ({ ...prev, [q.id]: text }))}
                                        placeholder="Describa la anomalía..."
                                    />
                                </View>
                            )}
                        </View>
                    ) : (
                        <TextInput
                            style={styles.input}
                            value={answers[q.id]}
                            onChangeText={(text) => handleAnswerChange(q.id, text)}
                            placeholder="Ingrese observaciones..."
                        />
                    )}

                    {/* Photo Section */}
                    <View style={styles.photoContainer}>
                        <TouchableOpacity onPress={() => takePhoto(q.id)} style={styles.photoButton}>
                            <Text style={styles.photoButtonText}>
                                {photos[q.id] ? 'Cambiar Foto' : 'Tomar Foto'}
                            </Text>
                        </TouchableOpacity>
                        {photos[q.id] && (
                            <Image source={{ uri: photos[q.id] }} style={styles.thumbnail} />
                        )}
                    </View>
                </View>
            ))}

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={saving}
            >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Guardar Inspección</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f3f4f6',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1f2937',
    },
    questionCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    categoryText: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    okText: { color: '#22c55e', fontWeight: 'bold' },
    failText: { color: '#ef4444', fontWeight: 'bold' },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
        marginBottom: 12,
    },
    inputSmall: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 6,
        padding: 8,
        fontSize: 14,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    photoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    photoButton: {
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    photoButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    thumbnail: {
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: '#eee',
    },
    submitButton: {
        backgroundColor: '#4f46e5',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    submitText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    anomalyContainer: {
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7f1d1d',
        marginBottom: 4,
    },
    severityRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    severityBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    sevLeve: { backgroundColor: '#fef08a', borderColor: '#eab308' },
    sevGrave: { backgroundColor: '#fdba74', borderColor: '#f97316' },
    sevCritica: { backgroundColor: '#fca5a5', borderColor: '#ef4444' },
    severityText: { fontSize: 12, color: '#4b5563' },
    severityTextSelected: { color: '#000', fontWeight: 'bold' },
});
