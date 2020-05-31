import React, { Component } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import HomeScreen from "./home";
import GameScreen from "./game";
import ClanScreen from "./clan";

const Tab = createBottomTabNavigator();

export default function MainTabScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused
                ? "ios-information-circle"
                : "ios-information-circle-outline";
              break;
            case "Game":
              iconName = focused ? "ios-list-box" : "ios-list";
              break;
            case "Clan":
              iconName = "ios-people";
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: "tomato",
        inactiveTintColor: "gray",
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Game" component={GameScreen} />
      <Tab.Screen name="Clan" component={ClanScreen} />
    </Tab.Navigator>
  );
}
