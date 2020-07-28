import React, { Component, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { environment } from "../environment/environment";

export default function HomeScreen({ navigation }) {
  const [allGames, setAllGames] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await getGames().then((games) => setAllGames(games));
    setLoading(false);
  };

  const getGames = async () => {
    try {
      const gamesPromise = await fetch(environment.game);
      if (!gamesPromise.ok) {
        throw Error("No game is found!");
      }
      return await gamesPromise.json();
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  const handleViewGame = (game_id) => {
    fetch(environment.game + "/" + game_id)
      .then((game) => game.json())
      .then((json) => {
        console.log(json);
        navigation.push("Room", {
          gameId: game_id,
          gameMode: json.game_mode,
          role: "spectator",
          row: parseInt(json.row),
          col: parseInt(json.col),
          isOver: "false",
        });
      });
  };

  const renderOneGame = ({
    game_id,
    black_nickname,
    white_nickname,
    result,
  }) => {
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: "row",
          marginVertical: 5,
          borderTopColor: "grey",
          borderTopWidth: 2,
          backgroundColor: "white",
        }}
        onPress={() => handleViewGame(game_id)}
        key={game_id}
      >
        <Text style={{ flex: 1, fontSize: 15, textAlign: "center" }}>
          {game_id}
        </Text>
        <Text style={{ flex: 1, fontSize: 15, textAlign: "center" }}>
          {"⚫ " + black_nickname + " vs " + "⚪ " + white_nickname}
        </Text>
        <Text style={{ flex: 2, fontSize: 15, textAlign: "center" }}>
          {result}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/background/home.png")}
      style={{ width: "100%", height: "100%" }}
    >
      <View style={styles.container}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 15,
            borderBottomColor: "grey",
            borderBottomWidth: 2,
          }}
        >
          All Games
        </Text>
        <ScrollView style={styles.scrollView}>
          {allGames === undefined
            ? null
            : allGames.map((game) => renderOneGame(game))}
        </ScrollView>
        <View style={{ alignItems: "center", padding: 10 }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleRefresh()}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={{ fontSize: 20 }}>Refresh</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
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
  },
  button: {
    alignItems: "center",
    textAlignVertical: "center",
    backgroundColor: "#DDDDDD",
    width: 150,
    padding: 10,
    // flex: 1,
  },
});
