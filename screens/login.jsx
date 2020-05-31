import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";

export default function LoginScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/home.png")}
      style={styles.background}
    >
      <View style={styles.background}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        ></Image>

        <TouchableOpacity>
          <Text style={styles.signup}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Main")}>
          <Text style={styles.login}>Log In</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  logo: {
    marginTop: "15%",
    width: 300,
    alignSelf: "center",
  },
  signup: {
    backgroundColor: "white",
    color: "#3A59FF",
    width: "75%",
    borderRadius: 25,
    textAlign: "center",
    fontWeight: "bold",
    marginLeft: "11%",
    padding: "2%",
    fontSize: 27,
    marginTop: "70%",
  },
  login: {
    backgroundColor: "#3A59FF",
    color: "white",
    width: "75%",
    borderRadius: 25,
    textAlign: "center",
    fontWeight: "bold",
    marginLeft: "11%",
    padding: "2%",
    fontSize: 27,
    marginTop: "10%",
  },
});
