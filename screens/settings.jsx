import React, { Component } from "react";
import { View, StyleSheet, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings screen</Text>
    </View>
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
