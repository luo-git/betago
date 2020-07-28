import React, { Component, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import firebase from "../firebase/firebase";
import * as ImagePicker from "expo-image-picker";
import { environment } from "../environment/environment";
import getUserToken from "../firebase/token";

export default function ProfileScreen({ navigation }) {
  let uid = undefined;
  const [myProfile, setMyProfile] = useState(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(true);
  const [myNickname, setMyNickname] = useState(undefined);
  const [myIntro, setMyIntro] = useState(undefined);
  const [myGames, setMyGames] = useState(undefined);
  const placeholderIntro = "Nothing to see here...";

  useEffect(() => {
    uid = firebase.auth().currentUser.uid;
    if (uid !== undefined && forceRefresh) {
      console.log("fetching user data!");
      fetch(environment.user + "/" + uid)
        .then((response) => {
          const responseJson = response.json();
          return Promise.resolve(responseJson);
        })
        .then((data) => {
          setMyProfile(data);
          setMyNickname(data.nickname);
          setMyIntro(data.intro);
        })
        .catch((error) => console.log(error));
      getGames(uid)
        .then((data) => setMyGames(data.record))
        .catch((error) => console.log(error));
      setForceRefresh(false);
    }
  }, [forceRefresh]);

  const handleChooseImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync();
    const uid = firebase.auth().currentUser.uid;

    if (!result.cancelled) {
      // Upload profile image to firebase storage
      uploadImage(result.uri, uid)
        .then(() => alert("Upload Success"))
        .catch((error) => console.log(error));

      // Update profile picture url in Firestore
      const imageRef = firebase.storage().ref("profile_images/" + uid);
      imageRef
        .getDownloadURL()
        .then(async (url) => {
          const userToken = await getUserToken();
          return fetch(`${environment.user}/${uid}/update`, {
            method: "POST",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              profile_picture: url,
            }),
          });
        })
        .then((res) => {
          if (res.ok) {
            setTimeout(() => setForceRefresh(true), 3000);
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const uploadImage = async (uri, uid) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const ref = firebase
      .storage()
      .ref()
      .child("profile_images/" + uid);
    return ref.put(blob);
  };

  const updateProfile = () => {
    const uid = firebase.auth().currentUser.uid;
    getUserToken()
      .then((userToken) =>
        fetch(`${environment.user}/${uid}/update`, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            nickname: myNickname,
            intro: myIntro,
          }),
        })
      )
      .then((res) => {
        if (res.ok) {
          setTimeout(() => setForceRefresh(true), 300);
          alert("Successfully updated profile!");
        } else {
          console.log("Update Failed!");
        }
      })
      .catch((error) => console.log(error));
    setModalVisible(false);
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
          isOver: "true",
        });
      });
  };

  const getGames = async (uid) => {
    try {
      const gamesPromise = await fetch(environment.user + "/" + uid + "/games");
      return await gamesPromise.json();
    } catch (error) {
      console.log(error);
    }
  };

  const renderOneGame = ({ id, black, white, result }) => {
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: "row",
          marginVertical: 5,
          borderTopColor: "grey",
          borderTopWidth: 2,
        }}
        onPress={() => handleViewGame(id)}
        key={id}
      >
        <Text style={{ flex: 1, fontSize: 15, textAlign: "center" }}>{id}</Text>
        <Text style={{ flex: 1, fontSize: 15, textAlign: "center" }}>
          {"⚫ " + black + " vs " + "⚪ " + white}
        </Text>
        <Text style={{ flex: 2, fontSize: 15, textAlign: "center" }}>
          {result}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontSize: 15 }}>Change Profile</Text>
            <Text style={{ fontSize: 15, marginTop: 20 }}>Nickname</Text>
            <TextInput
              defaultValue={myProfile === undefined ? "" : myProfile.nickname}
              onChangeText={(text) => setMyNickname(text)}
              style={styles.input}
            ></TextInput>
            <TextInput
              defaultValue={
                myProfile === undefined
                  ? placeholderIntro
                  : myProfile.intro === undefined
                  ? placeholderIntro
                  : myProfile.intro
              }
              onChangeText={(text) => setMyIntro(text)}
              style={styles.inputLarge}
            ></TextInput>
            <TouchableOpacity
              style={{ ...styles.button, marginTop: 10 }}
              onPress={() => updateProfile()}
            >
              <Text style={{ fontSize: 15 }}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ ...styles.button, marginTop: 10 }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Text style={{ textAlign: "center", fontSize: 15 }}>My Profile</Text>
      <View style={styles.profileContainer}>
        <TouchableOpacity
          onPress={() => handleChooseImage()}
          style={styles.profilePicture}
        >
          <Image
            source={
              myProfile === undefined
                ? require("../assets/icon_color.png")
                : { uri: myProfile.profile_picture }
            }
            style={styles.profilePicture}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: "column" }}>
          <Text style={styles.text}>
            {myProfile === undefined
              ? "username"
              : myProfile.nickname + "\nRating: " + myProfile.elo}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1.5, borderColor: "grey", borderWidth: 2 }}>
        <Text style={styles.textAlignTop}>Self Introduction</Text>
        <Text style={{ fontSize: 15, margin: 20 }}>
          {myProfile === undefined
            ? placeholderIntro
            : myProfile.intro === undefined
            ? placeholderIntro
            : myProfile.intro}
        </Text>
      </View>
      <View style={{ flex: 1.5 }}>
        <Text style={styles.textAlignTop}>My Games</Text>
        <View style={{ flexDirection: "row", flex: 1 }}>
          <Text style={styles.text}>All Games</Text>
          <Text style={styles.text}>
            {myProfile === undefined
              ? ""
              : `Games played: ${myProfile.games_played}`}
          </Text>
          <Text style={styles.text}>
            {myProfile === undefined ? "" : `Wins: ${myProfile.num_wins}`}
          </Text>
          <Text style={styles.text}>
            {myProfile === undefined
              ? ""
              : `Winrate: ${(
                  (myProfile.num_wins /
                    (myProfile.games_played === 0
                      ? 1
                      : myProfile.games_played)) *
                  100
                ).toFixed(2)}%`}
          </Text>
        </View>
      </View>
      <View style={{ flex: 4, borderColor: "grey", borderWidth: 2 }}>
        <View style={{ flexDirection: "row", marginHorizontal: 20 }}>
          <Text style={{ flex: 1, fontSize: 15, textAlign: "center" }}>
            Game ID
          </Text>
          <Text style={{ flex: 1, fontSize: 15, textAlign: "center" }}>
            Players
          </Text>
          <Text style={{ flex: 2, fontSize: 15, textAlign: "center" }}>
            Result
          </Text>
        </View>
        <ScrollView style={styles.scrollView}>
          {myGames === undefined
            ? null
            : myGames
                .slice(0)
                .reverse()
                .map((game) => renderOneGame(game))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 15,
  },
  textAlignTop: {
    textAlign: "center",
    fontSize: 15,
  },
  container: {
    flex: 4,
  },
  profileContainer: {
    flex: 1.5,
    flexDirection: "row",
    padding: 10,
    borderWidth: 2,
    borderColor: "grey",
  },
  profilePicture: {
    resizeMode: "contain",
    height: "100%",
    flex: 1,
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
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  input: {
    height: 40,
    width: 200,
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    margin: 10,
  },
  inputLarge: {
    textAlignVertical: "top",
    height: 150,
    width: 400,
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
  scrollView: {
    backgroundColor: "pink",
    marginHorizontal: 20,
  },
});
