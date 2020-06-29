import React, { Component, useState } from "react";
import { View, StyleSheet } from "react-native";
import Goban from "../goban/goban";

const RoomScreen = ({ route, navigation }) => {
  const [boardWidth, setBoardWidth] = useState(400);
  const { gameMode, gameId } = route.params;

  return (
    <View
      onLayout={(event) => setBoardWidth(event.nativeEvent.layout.width)}
      style={styles.container}
    >
      <Goban
        boardWidth={boardWidth}
        boardSize={[9, 9]}
        game_id={1}
        gameMode={gameMode}
      />
    </View>
  );
};

export default RoomScreen;

const styles = StyleSheet.create({
  text: {
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  input: {
    height: 40,
    width: 200,
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    margin: 10,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
  },
});
