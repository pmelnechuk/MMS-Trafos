
import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import LoginScreen from '../screens/LoginScreen'
import HomeScreen from '../screens/HomeScreen'
import QRScannerScreen from '../screens/QRScannerScreen'
import TransformerDetailScreen from '../screens/TransformerDetailScreen'
import InspectionFormScreen from '../screens/InspectionFormScreen'
import { View, ActivityIndicator } from 'react-native'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
    }, [])

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {session && session.user ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
                        <Stack.Screen name="TransformerDetail" component={TransformerDetailScreen} />
                        <Stack.Screen name="InspectionForm" component={InspectionFormScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    )
}
