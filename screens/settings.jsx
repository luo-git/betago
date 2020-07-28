import React, { Component, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  Picker,
  ImageBackground,
} from "react-native";
import firebase from "../firebase/firebase";
import { goOffline } from "../firebase/presence";
import { getEmoteOption, storeEmoteOption } from "../data/localStorage";

export default function SettingsScreen() {
  const [emoteEnabled, setEmoteEnabled] = useState(true);

  const handleSignOut = () => {
    firebase.auth().signOut();
    goOffline();
  };

  useEffect(() => {
    getEmoteOption().then(async (option) => {
      if (option === undefined) {
        setEmoteEnabled(true);
        await storeEmoteOption(true);
      }
      setEmoteEnabled(option);
    });
  }, []);

  const handleSetEmoteOption = async (option) => {
    setEmoteEnabled(option);
    await storeEmoteOption(option);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/background/home.png")}
        style={{ width: "100%", height: "100%" }}
      >
        <View style={{ backgroundColor: "white" }}>
          <Text style={styles.text}>Settings screen</Text>
        </View>
        <View
          style={{
            flex: 1,
            borderTopColor: "grey",
            borderTopWidth: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center",
              alignSelf: "center",
              backgroundColor: "white",
              margin: 20,
            }}
          >
            <Text style={{ ...styles.text }}>Emote Option</Text>
            <Picker
              style={{ width: 160 }}
              selectedValue={emoteEnabled}
              onValueChange={async (value) => handleSetEmoteOption(value)}
            >
              <Picker.Item label="Enable" value="true" />
              <Picker.Item label="Disable" value="false" />
            </Picker>
          </View>
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSignOut()}
            >
              <Text>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
  },
});
