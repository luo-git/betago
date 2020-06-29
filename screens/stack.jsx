import React, { Component } from "react";
import { Button, View, Text } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./login";
import MainScreen from "./main";
import LoadingScreen from "./loading";
import RoomScreen from "./room";

const Stack = createStackNavigator();

const StackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={{
          headerLeft: null,
          title: "BetaGo",
        }}
      />
      <Stack.Screen name="Room" component={RoomScreen} />
    </Stack.Navigator>
  );
};

export default StackScreen;
