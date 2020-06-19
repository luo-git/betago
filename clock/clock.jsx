import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * Go Clock
 * Props: remainingSecs
 */

const getRemainingTime = (time) => {
  const min = Math.floor(time / 60);
  const sec = time - min * 60;
  return { min: formatNumber(min), sec: formatNumber(sec) };
};

const formatNumber = (num) => {
  return num < 10 ? "0" + num : num;
};

export default function GoClock(props) {
  const [remainingSecs, setRemainingSecs] = useState(props.remainingSecs);
  const [isActive, setIsActive] = useState(false);
  const { min, sec } = getRemainingTime(remainingSecs);

  const toggle = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      if (remainingSecs > 0) {
        interval = setInterval(() => {
          setRemainingSecs((remainingSecs) => remainingSecs - 1);
        }, 1000);
      }
    } else if (!isActive && remainingSecs !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }),
    [isActive, remainingSecs];

  return (
    <View style={styles.container}>
      <Text
        style={remainingSecs <= 10 ? styles.textWarning : styles.text}
        onPress={toggle}
      >{`${min}:${sec}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
  },
  textWarning: {
    fontSize: 20,
    color: "red",
  },
});
