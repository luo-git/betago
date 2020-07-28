import React, { Component, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Picker,
  Modal,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { environment } from "../environment/environment";
import firebase from "../firebase/firebase";
import getUserToken from "../firebase/token";

const db = firebase.firestore();

export default function GameScreen({ navigation }) {
  const [gameIdCreate, setGameIdCreate] = useState(1);
  const [gameIdJoin, setGameIdJoin] = useState(1);
  const [row, setRow] = useState(9);
  const [col, setCol] = useState(9);
  const [gameModeCreate, setGameModeCreate] = useState("Test");
  const [gameModeJoin, setGameModeJoin] = useState("Test");
  const [modalVisible, setModalVisible] = useState(false);
  const [inQueue, setInQueue] = useState(undefined);
  let unsubscribe = undefined;

  useEffect(() => {
    if (unsubscribe !== undefined) {
      return () => unsubscribe();
    }
  }, []);

  const handleCreateGame = () => {
    getUserToken().then((userToken) => {
      fetch(environment.game + "/create", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          game_id: gameIdCreate,
          time_limit: 600,
          game_mode: gameModeCreate,
          row: row,
          col: col,
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
    });
  };

  const handleJoinGame = (gameId, gameMode) => {
    getUserToken().then((userToken) => {
      fetch(environment.game + "/" + gameId + "/join", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          game_mode: gameMode,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            alert("Unable to Join Game!");
            throw Error(
              "Unable to join Game" + JSON.stringify(response.json())
            );
          }
          setInQueue(undefined);
          setModalVisible(false);
          return response.json();
        })
        .then((json) => {
          navigation.push("Room", {
            gameId: gameId,
            gameMode: gameMode,
            role: json.success.role,
            row: parseInt(json.success.row),
            col: parseInt(json.success.col),
            isOver: json.success.is_over,
          });
        })
        .catch((error) => console.log(error));
    });
  };

  // Only size 9, 13, 19, seasonal are permitted
  const handleJoinQueue = (size) => {
    if (inQueue !== undefined) {
      alert("Cannot join multiple queue!");
      return;
    }
    console.log(`${environment.queue}/${size}/join`);
    getUserToken().then((userToken) => {
      fetch(`${environment.queue}/${size}/join`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: {},
      })
        .then((response) => {
          if (response.ok) {
            setInQueue(size);
            alert(`Joined queue`);
            listenToJoinGame(firebase.auth().currentUser.uid);
            return response;
          } else {
            response.json().then((json) => alert(JSON.stringify(json)));
            throw Error("Could not join queue!");
          }
        })
        .catch((error) => console.log(error));
    });
  };

  const listenToJoinGame = (uid) => {
    console.log("Called Listener with", uid);
    unsubscribe = db
      .collection("matching")
      .doc(uid)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          console.log("Joining", snapshot.data().game_id);
          handleJoinGame(snapshot.data().game_id, "Play");
          unsubscribe();
        }
      });
  };

  const handleQuitQueue = (size) => {
    console.log(`${environment.queue}/${size}/remove`);
    getUserToken().then((userToken) => {
      fetch(`${environment.queue}/${size}/remove`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: {},
      })
        .then((response) => {
          if (response.ok) {
            setInQueue(undefined);
            alert(`Successfully quitted!`);
            if (unsubscribe !== undefined) {
              unsubscribe();
            }
            return response;
          } else {
            response
              .json()
              .then((json) =>
                alert(`Could not quit queue! ${JSON.stringify(json)}`)
              );
            throw Error("Could not quit queue!");
          }
        })
        .catch((error) => console.log(error));
    });
  };

  return (
    <React.Fragment>
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.container}>
              <Text style={{ ...styles.text, marginTop: 50 }}>Create Game</Text>
              <TextInput
                style={styles.input}
                placeholder="Game ID"
                onChangeText={(text) => setGameIdCreate(text)}
              />
              <Picker
                style={{ width: 160 }}
                selectedValue={gameModeCreate}
                onValueChange={(currentGameMode) =>
                  setGameModeCreate(currentGameMode)
                }
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
              <Text style={{ ...styles.text, marginTop: 10 }}>Board Size</Text>
              <TextInput
                style={styles.input}
                placeholder="Row"
                onChangeText={(text) => setRow(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Colume"
                onChangeText={(text) => setCol(text)}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleCreateGame()}
              >
                <Text>Create</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.text }}>Join Game </Text>
              <TextInput
                style={styles.input}
                placeholder="Game ID"
                onChangeText={(text) => setGameIdJoin(text)}
              />
              <Picker
                style={{ width: 160 }}
                selectedValue={gameModeJoin}
                onValueChange={(currentGameMode) =>
                  setGameModeJoin(currentGameMode)
                }
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
                onPress={() => handleJoinGame(gameIdJoin, gameModeJoin)}
              >
                <Text>Join</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(false)}
              >
                <Text>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View
        style={{
          ...styles.centeredView,
          flexDirection: "row",
          backgroundColor: "#FFD55A",
        }}
      >
        <ImageBackground
          source={require("../assets/background/2.jpg")}
          style={{ width: "100%", height: "100%" }}
        >
          <View
            style={{
              ...styles.centeredView,
              flexDirection: "row",
            }}
          >
            <Text style={styles.textExtraLarge}>9x9 Queue</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleJoinQueue(9)}
            >
              {inQueue === 9 ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.textLarge}>Join Queue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleQuitQueue(9)}
            >
              <Text style={styles.textLarge}>Quit Queue</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
      <View
        style={{
          ...styles.centeredView,
          flexDirection: "row",
          backgroundColor: "#6DD47E",
        }}
      >
        <ImageBackground
          source={require("../assets/background/3.jpg")}
          style={{ width: "100%", height: "100%" }}
        >
          <View
            style={{
              ...styles.centeredView,
              flexDirection: "row",
            }}
          >
            <Text style={styles.textExtraLarge}>13x13 Queue</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleJoinQueue(13)}
            >
              {inQueue === 13 ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.textLarge}>Join Queue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleQuitQueue(13)}
            >
              <Text style={styles.textLarge}>Quit Queue</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
      <View
        style={{
          ...styles.centeredView,
          flexDirection: "row",
          backgroundColor: "#1F8AC0",
        }}
      >
        <ImageBackground
          source={require("../assets/background/4.jpg")}
          style={{ width: "100%", height: "100%" }}
        >
          <View
            style={{
              ...styles.centeredView,
              flexDirection: "row",
            }}
          >
            <Text style={styles.textExtraLarge}>19x19 Queue</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleJoinQueue(19)}
            >
              {inQueue === 19 ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.textLarge}>Join Queue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleQuitQueue(19)}
            >
              <Text style={styles.textLarge}>Quit Queue</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
      <View
        style={{
          ...styles.centeredView,
          flexDirection: "row",
          backgroundColor: "#F93822FF",
        }}
      >
        <ImageBackground
          source={require("../assets/background/1.jpg")}
          style={{ width: "100%", height: "100%" }}
        >
          <View
            style={{
              ...styles.centeredView,
              flexDirection: "row",
            }}
          >
            <Text style={styles.textExtraLarge}>Seasonal Queue</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleJoinQueue("seasonal")}
            >
              {inQueue === "seasonal" ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.textLarge}>Join Queue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleQuitQueue("seasonal")}
            >
              <Text style={styles.textLarge}>Quit Queue</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.text}>Manual Game Creation and Join</Text>
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
    fontSize: 15,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    margin: 10,
  },
  textLarge: {
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 15,
  },
  textExtraLarge: {
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 25,
    textShadowColor: "white",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});
