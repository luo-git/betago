/**
 * Go Clock
 * Props: remainingSecs
 */

const getFormattedTime = (time) => {
  const min = Math.floor(time / 60);
  const sec = time - min * 60;
  return { min: formatNumber(min), sec: formatNumber(sec) };
};

const formatNumber = (num) => {
  return num < 10 ? "0" + num : num;
};

// Custom setInterval function to get accurate time
// by using Date.now() to compensate for time diff
const customSetInterval = (func, time) => {
  var lastTime = Date.now(),
    lastDelay = time,
    outp = {};

  // For every tick
  function tick() {
    // Run function
    func();

    // Record down different in time and compensate
    var now = Date.now(),
      dTime = now - lastTime;

    lastTime = now;
    lastDelay = time + lastDelay - dTime;
    outp.id = setTimeout(tick, lastDelay);
  }
  outp.id = setTimeout(tick, time);

  return outp;
};

// Logic for clock
export default class GoClock {
  constructor(remainingTime, isActive) {
    this.remainingTime = remainingTime;
    this.isActive = isActive;

    this.interval = setInterval(() => {
      if (this.isActive && remainingTime > 0) {
        this.remainingTime -= 1;
      }
    }, 1000);
  }

  pause() {
    this.isActive = false;
  }

  start = () => {
    this.isActive = true;
  };

  // Get time in seconds
  getTime = () => {
    return this.remainingTime;
  };

  // Get formated time {min: xx, sec: xx}
  getTimeFormated = () => {
    return getFormattedTime(this.remainingTime);
  };

  setTime = (time) => {
    this.remainingTime = time;
  };

  clearTime = () => {
    clearInterval(this.interval);
  };
}

export { customSetInterval, getFormattedTime };
