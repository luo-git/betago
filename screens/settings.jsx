import React, { Component } from "react";
import { View, StyleSheet, Text, Button } from "react-native";
import firebase from "firebase";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings screen</Text>
      <Button title="Sign Out" onPress={() => firebase.auth().signOut()} />
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
