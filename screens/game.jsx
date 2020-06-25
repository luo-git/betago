import React, { Component, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Goban from "../goban/goban";

export default function GameScreen() {
  const [boardWidth, setBoardWidth] = useState(400);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Game screen</Text>
      <View
        onLayout={(event) => setBoardWidth(event.nativeEvent.layout.width)}
        style={styles.container}
      >
        <Goban boardWidth={boardWidth} boardSize={[9, 9]} />
      </View>
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
