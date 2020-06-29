import React, { Component, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Picker,
} from "react-native";
import Goban from "../goban/goban";
import { environment } from "../environment/environment";

export default function GameScreen({ navigation }) {
  const [gameIdCreate, setGameIdCreate] = useState(1);
  const [gameIdJoin, setGameIdJoin] = useState(1);
  const [gameMode, setGameMode] = useState("Test");

  const handleCreateGame = () => {
    fetch(environment.create_game, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        game_id: gameIdCreate,
        time_limit: 600,
        game_mode: gameMode,
      }),
    })
      .then((response) => {
        if (response.ok) {
          alert(`Created Game ${gameIdCreate}`);
          return response;
        } else {
          alert(`Could not create game!\nID already in use!`);
          throw Error("Could not create game!");
        }
      })
      .catch((error) => console.log(error));
  };

  const handleJoinGame = () => {
    fetch(environment.retrieve_game + "/" + gameIdJoin)
      .then((response) => {
        if (!response.ok) {
          alert("Unable to Join Game!");
          throw Error("Unable to join Game");
        } else {
          navigation.push("Room", { gameId: gameIdJoin, gameMode: gameMode });
        }
        return response;
      })
      .catch((error) => console.log(error));
  };

  return (
    <React.Fragment>
      <View style={styles.container}>
        <Text style={{ ...styles.text, marginTop: 50 }}>Create Game</Text>
        <TextInput
          style={styles.input}
          placeholder="Game ID"
          onChangeText={(text) => setGameIdCreate(text)}
        />
        <Picker
          style={{ width: 160 }}
          selectedValue={gameMode}
          onValueChange={(currentGameMode) => setGameMode(currentGameMode)}
        >
          <Picker.Item
            label="Test Mode (able to play alone online)"
            value="Test"
          />
          <Picker.Item
            label="Play mode (need another player to join)"
            value="Play"
          />
        </Picker>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleCreateGame()}
        >
          <Text>Create</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={{ ...styles.text, marginTop: 50 }}>Join Game </Text>
        <TextInput
          style={styles.input}
          placeholder="Game ID"
          onChangeText={(text) => setGameIdJoin(text)}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleJoinGame()}
        >
          <Text>Join</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
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
