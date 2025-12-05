
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { supabase } from '../lib/supabase'
import { SyncService } from '../services/SyncService'
import { useNavigation } from '@react-navigation/native'

export default function HomeScreen() {
    const [syncing, setSyncing] = useState(false)
    const navigation = useNavigation<any>()

    const handleSync = async () => {
        setSyncing(true)
        try {
            const tRes = await SyncService.syncTransformers()
            const tpRes = await SyncService.syncTemplates()

            if (tRes.success && tpRes.success) {
                Alert.alert('Éxito', `Datos sincronizados.\nActivos: ${tRes.count || 0}`)
            } else {
                Alert.alert('Error', 'Hubo un problema al sincronizar')
            }
        } catch (e) {
            console.error(e)
            Alert.alert('Error', 'Fallo en la sincronización')
        } finally {
            setSyncing(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Transform-Control</Text>

            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={[styles.card, styles.scanCard]}
                    onPress={() => navigation.navigate('QRScanner')}
                >
                    <Text style={styles.cardTitle}>Escanear QR</Text>
                    <Text style={styles.cardSubtitle}>Iniciar inspección</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, styles.syncCard]}
                    onPress={handleSync}
                    disabled={syncing}
                >
                    {syncing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.cardTitle}>Sincronizar</Text>
                            <Text style={styles.cardSubtitle}>Descargar datos</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => supabase.auth.signOut()}
            >
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 40,
        textAlign: 'center',
    },
    menuContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 20,
    },
    card: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    scanCard: {
        backgroundColor: '#4f46e5',
    },
    syncCard: {
        backgroundColor: '#059669',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#e0e7ff',
    },
    logoutButton: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 16,
    },
})
