
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { getDB } from '../lib/db';

export default function QRScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const navigation = useNavigation<any>();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>Necesitamos permiso para usar la cámara</Text>
                <Button onPress={requestPermission} title="Dar permiso" />
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        try {
            // Assume data is the ID or a JSON containing the ID
            let transformerId = data;
            try {
                const parsed = JSON.parse(data);
                if (parsed.id) transformerId = parsed.id;
            } catch (e) {
                // Not JSON, assume string ID
            }

            const db = await getDB();
            const result = await db.getFirstAsync('SELECT * FROM transformers WHERE id = ?', [transformerId]);

            if (result) {
                navigation.replace('TransformerDetail', { transformer: result });
            } else {
                Alert.alert(
                    'No encontrado',
                    `No se encontró el activo con ID: ${transformerId} en la base de datos local. Asegúrate de sincronizar.`,
                    [{ text: 'OK', onPress: () => setScanned(false) }]
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Error al procesar el código QR', [{ text: 'OK', onPress: () => setScanned(false) }]);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            <View style={styles.overlay}>
                <Text style={styles.text}>Escanea el código QR del transformador</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 5,
    },
});
