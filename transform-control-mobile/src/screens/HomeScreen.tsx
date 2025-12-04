
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { supabase } from '../lib/supabase'

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido Técnico</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => supabase.auth.signOut()}
            >
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#ef4444',
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
})
