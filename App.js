import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Goban from "./goban/goban";

export default class App extends React.Component {
  state = { boardWidth: 0 };

  handlePress = () => {};

  measureView = (event) => {
    this.setState({ boardWidth: event.nativeEvent.layout.width });
  };

  render() {
    return (
      <View
        onLayout={(event) => this.measureView(event)}
        style={styles.container}
      >
        <Goban boardWidth={this.state.boardWidth} boardSize={[9, 9]} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    flex: 1,
  },
});
