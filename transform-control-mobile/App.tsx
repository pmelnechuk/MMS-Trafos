import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/lib/db';

export default function App() {
  useEffect(() => {
    initDB().catch(e => console.error('DB Init Error:', e));
  }, []);

  return <AppNavigator />;
}
