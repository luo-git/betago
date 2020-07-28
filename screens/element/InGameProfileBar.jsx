import React, { Component, useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { environment } from "../../environment/environment";
import { getFormattedTime } from "../../logic/clock";

const InGameProfileBar = (props) => {
  const [myProfile, setMyProfile] = useState(undefined);

  useEffect(() => {
    console.log(props.colour);
    const ac = new AbortController();
    if (props.uid !== undefined) {
      fetch(environment.user + "/" + props.uid, { signal: ac.signal })
        .then((response) => {
          const responseJson = response.json();
          return Promise.resolve(responseJson);
        })
        .then((data) => setMyProfile(data))
        .catch((error) => console.log(error));
    }
    return () => ac.abort();
  }, [props.uid, props.forceUpdate]);

  const renderTime = (time) => {
    const timeObj = getFormattedTime(time);
    return timeObj.min + ":" + timeObj.sec;
  };

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View style={styles.container}>
        <Image
          source={
            myProfile === undefined
              ? require("../../assets/icon_color.png")
              : { uri: myProfile.profile_picture }
          }
          style={styles.profilePicture}
        />
        <Text style={styles.text}>
          {myProfile === undefined
            ? "username"
            : (props.colour === "black" ? "⚫ " : "⚪ ") +
              myProfile.nickname +
              "\nRating: " +
              myProfile.elo}
        </Text>
        {props.time !== undefined ? (
          <Text style={{ fontSize: 20, flex: 1, textAlign: "center" }}>
            {renderTime(props.time)}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default InGameProfileBar;

const styles = StyleSheet.create({
  container: {
    borderColor: "grey",
    borderWidth: 2,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  profilePicture: {
    resizeMode: "contain",
    height: "100%",
    flex: 1,
  },
  text: {
    fontSize: 20,
    flex: 1,
  },
});
