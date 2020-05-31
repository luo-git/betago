import React, { Component } from "react";
import { View, StyleSheet, Text } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ProfileScreen from "./profile";
import SettingsScreen from "./settings";
import MainTabScreen from "./maintab";

const Drawer = createDrawerNavigator();

export default function MainScreen() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={MainTabScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
