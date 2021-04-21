import * as posenet from "@tensorflow-models/posenet";

let loadPoseNet = function () {
  return posenet
    .load({
      architecture: "MobileNetV1",
      outputStride: 16,
      inputResolution: { width: 640, height: 480 },
      multiplier: 0.5,
    })
    .then((res) => {
      return res;
    });
};
export default loadPoseNet
