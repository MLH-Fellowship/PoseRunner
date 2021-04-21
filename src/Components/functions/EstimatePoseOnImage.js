export async function estimatePoseOnImage(imageElement, net) {
  // estimate poses
  const poses = await net.estimateSinglePose(imageElement, {
    flipHorizontal: true,
  });

  return poses;
}
