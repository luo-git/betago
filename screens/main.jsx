import React, { Component } from "react";
import { View, StyleSheet, Text, Button } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ProfileScreen from "./profile";
import SettingsScreen from "./settings";
import MainTabScreen from "./maintab";
import { DrawerActions } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

const Drawer = createDrawerNavigator();

export default function MainScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Ionicons
          name="ios-menu"
          size={35}
          color="black"
          style={{ marginLeft: 15 }}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
      ),
    });
  }, [navigation]);

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
