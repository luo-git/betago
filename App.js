import React from "react";
import "react-native-gesture-handler";
import { Asset } from "expo-asset";
import { AppLoading } from "expo";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import StackScreen from "./screens/stack";
import { enableScreens } from "react-native-screens";

import { decode, encode } from "base-64";
import { YellowBox } from "react-native";
import _ from "lodash";

// Fix cannot find atob warning
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// Fix setting a timer warning
YellowBox.ignoreWarnings(["Setting a timer"]);
const _console = _.clone(console);
console.warn = (message) => {
  if (message.indexOf("Setting a timer") <= -1) {
    _console.warn(message);
  }
};

// Enable perf optimisation
enableScreens();

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // Check for preloading of assets
      isReady: false,
    };
  }

  // Fetch assets before showing app
  async _loadAssetsAsync() {
    const imageAssets = cacheImages([require("./assets/background/bg.jpg")]);
    await Promise.all([...imageAssets]);
  }

  measureView = (event) => {
    this.setState({ boardWidth: event.nativeEvent.layout.width });
  };

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._loadAssetsAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }

    return (
      <NavigationContainer>
        <StackScreen />
      </NavigationContainer>
    );
  }
}

// Function to cache images
function cacheImages(images) {
  return images.map((image) => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    flex: 1,
  },
});
