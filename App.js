//import React from 'react';
//import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
// import { StyleSheet } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { useRoute } from "./route";

export default function App() {
  const routing = useRoute(true);
  return <NavigationContainer>{routing}</NavigationContainer>;
}
