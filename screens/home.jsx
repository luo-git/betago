import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import GoClock from "../clock/clock";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Some Go related news here.</Text>
      {/* <GoClock remainingSecs={60} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
