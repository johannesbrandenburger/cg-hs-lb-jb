// @ts-check

/**
 * Animates the scene
 */
async function animate() {
  requestAnimationFrame(animate);
  handleWalking();
  //handleAnimateChairs();
  renderer.render(scene, camera);
  await new Promise(resolve => setTimeout(resolve, animationTimeoutMs));
}
