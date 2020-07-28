import React, { Component } from "react";
import { View, StyleSheet, Text, Image } from "react-native";

export default function StashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>stash screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
