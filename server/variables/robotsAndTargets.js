const GREEN_ROBOT = 0;
const RED_ROBOT = 1;
const BLUE_ROBOT = 2;
const YELLOW_ROBOT = 3;

// Color of target.
const GREEN_TARGET = 0;
const RED_TARGET = 1;
const BLUE_TARGET = 2;
const YELLOW_TARGET = 3;
const WILD_TARGET = 4;

// Shape of target.
const CRICLE_TARGET = 0;
const TRIANGLE_TARGET = 1;
const SQUARE_TARGET = 2;
const HEXAGON_TARGET = 3;
const VORTEX_TARGET = 4;

// Maps robot color to target color.
const targetRobotColorMap = {};
targetRobotColorMap[GREEN_TARGET] = GREEN_ROBOT;
targetRobotColorMap[RED_TARGET] = RED_ROBOT;
targetRobotColorMap[BLUE_TARGET] = BLUE_ROBOT;
targetRobotColorMap[YELLOW_TARGET] = YELLOW_ROBOT;
targetRobotColorMap[WILD_TARGET] = undefined;

module.exports = {
  GREEN_ROBOT,
  RED_ROBOT,
  BLUE_ROBOT,
  YELLOW_ROBOT,
  GREEN_TARGET,
  RED_TARGET,
  BLUE_TARGET,
  YELLOW_TARGET,
  WILD_TARGET,
  CRICLE_TARGET,
  TRIANGLE_TARGET,
  SQUARE_TARGET,
  HEXAGON_TARGET,
  VORTEX_TARGET,
  targetRobotColorMap,
};
