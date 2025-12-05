
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function TransformerDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { transformer } = route.params;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{transformer.serial_number}</Text>
                <Text style={styles.subtitle}>{transformer.brand} - {transformer.model}</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>Potencia:</Text>
                    <Text style={styles.value}>{transformer.power_kva} kVA</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Estado:</Text>
                    <View style={[
                        styles.badge,
                        transformer.status === 'GREEN' ? styles.bgGreen :
                            transformer.status === 'YELLOW' ? styles.bgYellow : styles.bgRed
                    ]}>
                        <Text style={styles.badgeText}>{transformer.status}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Ubicación:</Text>
                    <Text style={styles.value}>
                        {transformer.location_lat ? `${transformer.location_lat}, ${transformer.location_lng}` : 'No registrada'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('InspectionForm', { transformerId: transformer.id })}
            >
                <Text style={styles.buttonText}>Iniciar Inspección</Text>
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
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        color: '#4b5563',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        color: '#1f2937',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    bgGreen: { backgroundColor: '#d1fae5' },
    bgYellow: { backgroundColor: '#fef3c7' },
    bgRed: { backgroundColor: '#fee2e2' },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
    button: {
        backgroundColor: '#4f46e5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
