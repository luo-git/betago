import React, { Component, useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import Goban from "../goban/goban";
import InGameProfileBar from "./element/InGameProfileBar";
import firebase from "../firebase/firebase";
import ReactNativeZoomableView from "@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView";
import getUserToken from "../firebase/token";
import { environment } from "../environment/environment";
import { getEmoteOption } from "../data/localStorage";

import GoClock from "../logic/clock";

const db = firebase.firestore();

const RoomScreen = ({ route, navigation }) => {
  const [boardWidth, setBoardWidth] = useState(400);
  const [player1, setPlayer1] = useState(undefined);
  const [player2, setPlayer2] = useState(undefined);
  const [player1Clock, setPlayer1Clock] = useState(undefined);
  const [player2Clock, setPlayer2Clock] = useState(undefined);
  const { gameMode, gameId, role, row, col, isOver } = route.params;
  const [turn, setTurn] = useState(1);
  const [actionNum, setActionNum] = useState(1);
  const [moveNum, setMoveNum] = useState(1);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [blackClock, setBlackClock] = useState(new GoClock(600, false));
  const [whiteClock, setWhiteClock] = useState(new GoClock(600, false));
  const [blackTime, setBlackTime] = useState(600);
  const [whiteTime, setWhiteTime] = useState(600);
  const [isCounting, setIsCounting] = useState(false);
  const [canUseTools, setCanUseTools] = useState(true);
  const [gameResult, setGameResult] = useState(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [myEmoteId, setMyEmoteId] = useState({ id: null, time: Date.now() });
  const [oppEmoteId, setOppEmoteId] = useState({ id: null, time: Date.now() });
  const [enableEmote, setEnableEmote] = useState(true);
  const emotes = [
    require("../assets/emote/1.png"),
    require("../assets/emote/2.png"),
    require("../assets/emote/3.png"),
    require("../assets/emote/4.png"),
    require("../assets/emote/5.png"),
    require("../assets/emote/6.png"),
    require("../assets/emote/7.png"),
    require("../assets/emote/8.png"),
    require("../assets/emote/9.png"),
  ];
  let blackInterval = undefined;
  let whiteInterval = undefined;
  const windowWidth = Math.round(Dimensions.get("window").width);
  const windowHeight = Math.round(Dimensions.get("window").height);

  const myEmoteFadeAnim = useRef(new Animated.Value(1)).current;
  const myEmoteSpringValue = new Animated.Value(0.3);

  const oppEmoteFadeAnim = useRef(new Animated.Value(1)).current;
  const oppEmoteSpringValue = new Animated.Value(0.3);

  const myEmoteFadeIn = () => {
    myEmoteSpringValue.setValue(0.3);
    Animated.parallel([
      Animated.timing(myEmoteFadeAnim, {
        toValue: 1,
        duration: 200,
      }),
      Animated.spring(myEmoteSpringValue, {
        toValue: 1,
        friction: 2,
        tension: 100,
      }),
    ]).start();
    setTimeout(() => myEmoteFadeOutSlow(), 1000);
  };

  const myEmoteFadeOut = () => {
    Animated.timing(myEmoteFadeAnim, {
      toValue: 0,
      duration: 100,
    }).start();
  };

  const myEmoteFadeOutSlow = () => {
    Animated.timing(myEmoteFadeAnim, {
      toValue: 0,
      duration: 1000,
    }).start();
  };

  const oppEmoteFadeIn = () => {
    oppEmoteSpringValue.setValue(0.3);
    Animated.parallel([
      Animated.timing(oppEmoteFadeAnim, {
        toValue: 1,
        duration: 200,
      }),
      Animated.spring(oppEmoteSpringValue, {
        toValue: 1,
        friction: 2,
        tension: 100,
      }),
    ]).start();
    setTimeout(() => oppEmoteFadeOutSlow(), 1000);
  };

  const oppEmoteFadeOut = () => {
    Animated.timing(oppEmoteFadeAnim, {
      toValue: 0,
      duration: 100,
    }).start();
  };

  const oppEmoteFadeOutSlow = () => {
    Animated.timing(oppEmoteFadeAnim, {
      toValue: 0,
      duration: 1000,
    }).start();
  };

  useEffect(() => {
    const myAsyncFunc = async () => {
      const option = await getEmoteOption();
      setEnableEmote(option);
    };
    myAsyncFunc();

    // Fetch profiles
    const unsub = db
      .collection("games")
      .doc(gameId.toString())
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          const black = snapshot.data().black_uid;
          const white = snapshot.data().white_uid;
          if (firebase.auth().currentUser.uid === white) {
            setPlayer1(white);
            setPlayer1Clock("white");
            setPlayer2(black);
            setPlayer2Clock("black");
          } else {
            setPlayer1(black);
            setPlayer1Clock("black");
            setPlayer2(white);
            setPlayer2Clock("white");
          }
          if (player1 !== undefined && player2 !== undefined) {
            unsub();
          }
        }
      });

    // Set interval to listen to black clock
    blackInterval = setInterval(() => {
      if (blackClock.getTime() >= 0) {
        setBlackTime(blackClock.getTime());
      } else {
        clearInterval(blackInterval);
        if (role === "black") {
          handleLose("time");
        }
      }
    }, 1000);
    // console.log("set black interval as " + blackInterval);

    // Set interval to listen to white clock
    whiteInterval = setInterval(() => {
      if (whiteClock.getTime() >= 0) {
        setWhiteTime(whiteClock.getTime());
      } else {
        clearInterval(whiteInterval);
        if (role === "white") {
          handleLose("time");
        }
      }
    }, 1000);

    return () => {
      unsub();
      blackClock.clearTime();
      clearInterval(blackInterval);
      whiteClock.clearTime();
      clearInterval(whiteInterval);
    };
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e) => {
      console.log(gameResult, "haha");
      if (
        gameResult !== undefined ||
        role === "spectator" ||
        gameMode === "Test"
      ) {
        // If game is over or user is spectator, continue and exit screen
        return;
      }

      // Prevent player from leaving
      e.preventDefault();

      // Prompt the user
      alert(
        "You cannot quit game unless the game is over",
        "Do you wish to resign?"
      );
    });

    return () => unsub();
  }, [navigation, gameResult]);

  const handleLose = (reason) => {
    getUserToken().then((userToken) => {
      console.log(`${environment.game}/${gameId}/lose`);
      fetch(`${environment.game}/${gameId}/lose`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          reason: reason,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            alert(`Loss not accpeted!`);
            throw Error("Loss not accepted!" + JSON.stringify(response));
          }
          return response;
        })
        .catch((error) => console.log(error));
    });
  };

  const handleGameOver = (result) => {
    blackClock.pause();
    whiteClock.pause();
    setCanUseTools(false);
    setGameResult(result);
  };

  const handlePass = () => {
    getUserToken().then((userToken) => {
      console.log(`${environment.game}/${gameId}/pass`);
      fetch(`${environment.game}/${gameId}/pass`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          player: turn,
          move_num: actionNum,
          time_left_black: blackClock.getTime(),
          time_left_white: whiteClock.getTime(),
        }),
      })
        .then((response) => {
          if (!response.ok) {
            alert(`Pass not accpeted!`);
            response.json().then((json) => console.log(json));
            throw Error("Pass not accepted!");
          }
          return response;
        })
        .catch((error) => console.log(error));
    });
  };

  const handleQuitCount = () => {
    getUserToken().then((userToken) => {
      console.log(`${environment.game}/${gameId}/quit_count`);
      fetch(`${environment.game}/${gameId}/quit_count`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: {},
      });
    });
  };

  const handleAcceptCount = () => {
    getUserToken().then((userToken) => {
      console.log(`${environment.game}/${gameId}/accept_count`);
      fetch(`${environment.game}/${gameId}/accept_count`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: {},
      })
        .then((response) => {
          if (!response.ok) {
            alert(`Unable to accept!`);
            response.json().then((json) => console.log(json));
            throw Error("Unable to accept count");
          }
          alert("Counting accepted! Please wait for your opponent.");
          return response;
        })
        .catch((error) => console.log(error));
    });
  };

  const renderEmotePreview = (id) => {
    return (
      <TouchableOpacity
        style={{
          alignContent: "center",
          alignItems: "center",
          borderColor: "lightgrey",
          borderWidth: 1,
        }}
        onPress={() => handleMyEmote(id)}
      >
        <Image
          style={{
            height: 100,
            width: 100,
            alignItems: "center",
            alignContent: "center",
            resizeMode: "contain",
            transform: [{ scale: 0.9 }],
          }}
          source={emotes[id]}
        />
      </TouchableOpacity>
    );
  };

  const handleMyEmote = (id) => {
    setMyEmoteId({ id: id, time: Date.now() });
    setModalVisible(false);
  };

  const renderMyEmote = (id) => {
    if (id === null) return null;
    return (
      <Animated.View style={[{ opacity: myEmoteFadeAnim }]}>
        <TouchableOpacity onPress={() => myEmoteFadeOut()}>
          <Animated.Image
            style={{
              height: 150,
              width: 150,
              resizeMode: "center",
              transform: [{ scale: myEmoteSpringValue }],
            }}
            source={emotes[id]}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderOppEmote = (id) => {
    if (id === null) return null;
    return (
      <Animated.View style={[{ opacity: oppEmoteFadeAnim }]}>
        <TouchableOpacity onPress={() => oppEmoteFadeOut()}>
          <Animated.Image
            style={{
              height: 150,
              width: 150,
              resizeMode: "center",
              transform: [{ scale: oppEmoteSpringValue }],
            }}
            source={emotes[id]}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Use effect when my emote id changes to fire up emote animation
  // And send emote info
  useEffect(() => {
    if (enableEmote !== false && enableEmote !== "false") {
      myEmoteFadeIn();
      if (role !== "spectator") {
        getUserToken().then((userToken) => {
          console.log(`${environment.game}/${gameId}/emote`);
          fetch(`${environment.game}/${gameId}/emote`, {
            method: "POST",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              authorization: `Bearer ${userToken}`,
            },
            body:
              role === "black"
                ? JSON.stringify({ black_emote: myEmoteId })
                : JSON.stringify({ white_emote: myEmoteId }),
          });
        });
      }
    }
  }, [myEmoteId]);

  // Use effect when opponent emote id changes to fire up emote animation
  useEffect(() => {
    if (enableEmote !== false && enableEmote !== "false") {
      oppEmoteFadeIn();
    }
  }, [oppEmoteId]);

  return (
    <React.Fragment>
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {renderEmotePreview(0)}
              {renderEmotePreview(1)}
              {renderEmotePreview(2)}
              {renderEmotePreview(3)}
              {renderEmotePreview(4)}
              {renderEmotePreview(5)}
              {renderEmotePreview(6)}
              {renderEmotePreview(7)}
              {renderEmotePreview(8)}
            </View>
            <TouchableOpacity
              style={{ ...styles.button, alignSelf: "center", marginTop: 20 }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.text}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {gameResult === undefined ? (
        <React.Fragment>
          <Text style={styles.text}>You are playing as {role}.</Text>
          <Text style={styles.text}>
            {turn === 1 ? "Black's Turn" : "White's Turn"}
          </Text>
        </React.Fragment>
      ) : (
        <Text style={styles.text}>{gameResult}</Text>
      )}
      <InGameProfileBar
        uid={player2}
        forceUpdate={forceUpdate}
        colour={
          role === "spectator" ? "white" : role === "black" ? "white" : "black"
        }
        time={isOver ? null : player2Clock === "black" ? blackTime : whiteTime}
      />

      <View
        onLayout={(event) => setBoardWidth(event.nativeEvent.layout.width)}
        style={{ flex: 5, overflow: "hidden" }}
      >
        <ReactNativeZoomableView
          maxZoom={1.5}
          minZoom={row !== col ? 0.8 : 1}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders={true}
          style={{
            backgroundColor: "white",
            padding: 5,
          }}
        >
          <Goban
            boardWidth={boardWidth}
            boardSize={[row, col]}
            game_id={gameId}
            gameMode={gameMode}
            role={role}
            setTurn={setTurn}
            setUpdate={setForceUpdate}
            handleGameOver={handleGameOver}
            blackClock={blackClock}
            whiteClock={whiteClock}
            setActionNum={setActionNum}
            setMoveNum={setMoveNum}
            setIsCounting={setIsCounting}
            setOppEmoteId={setOppEmoteId}
            setMyEmoteId={setMyEmoteId}
          />
        </ReactNativeZoomableView>
      </View>
      <InGameProfileBar
        uid={player1}
        forceUpdate={forceUpdate}
        colour={role === "spectator" ? "black" : role}
        time={isOver ? null : player1Clock === "black" ? blackTime : whiteTime}
      />
      <View style={styles.bottomRow}>
        {isCounting && role !== "spectator" && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleAcceptCount()}
          >
            <Text style={styles.text}>Accept Territory</Text>
          </TouchableOpacity>
        )}
        {canUseTools && !isCounting && (
          <TouchableOpacity style={styles.button} onPress={() => handlePass()}>
            <Text style={styles.text}>Pass</Text>
          </TouchableOpacity>
        )}
        {(role === "black" || role === "white") &&
          enableEmote !== false &&
          enableEmote !== "false" && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.text}>Emote</Text>
            </TouchableOpacity>
          )}
        {canUseTools && !isCounting && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleLose("resign")}
          >
            <Text style={styles.text}>Resign</Text>
          </TouchableOpacity>
        )}
        {isCounting && role !== "spectator" && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleQuitCount()}
          >
            <Text style={styles.text}>Back to game</Text>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          position: "absolute",
          left: windowWidth / 2,
          top: windowHeight / 1.35,
        }}
      >
        {renderMyEmote(myEmoteId.id)}
      </View>

      <View
        style={{
          position: "absolute",
          left: windowWidth / 2,
          top: windowHeight / 15,
        }}
      >
        {renderOppEmote(oppEmoteId.id)}
      </View>
    </React.Fragment>
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
    textAlignVertical: "center",
    backgroundColor: "#DDDDDD",
    width: 150,
    padding: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    shadowColor: "#000",
    maxWidth: 400,
    opacity: 0.96,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});
