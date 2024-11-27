import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './DrawerNavigator'; // Import your DrawerNavigator component

const loadFonts = async () => {
  await Font.loadAsync({
    Rubik: require('./assets/fonts/Rubik-VariableFont_wght.ttf'),
    RubikItalic: require('./assets/fonts/Rubik-Italic-VariableFont_wght.ttf'),
  });
};

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4B7F79" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
