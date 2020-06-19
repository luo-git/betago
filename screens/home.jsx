import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import GoClock from "../clock/clock";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
      <GoClock remainingSecs={60} />
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
