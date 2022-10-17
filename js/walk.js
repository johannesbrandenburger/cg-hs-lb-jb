// @ts-check

// create config
const headHeight = 4;
const startPoint = new THREE.Vector3(-10, headHeight, -3);
const distancePerWalk = 0.2;
const mouseRotateSpeed = 0.002;
const directions = {
  forward: 0,
  backward: 1,
  left: 2,
  right: 3
};
const playerWidth = 1;
const mouseZoomSpeed = 0.8;

function initWalk() {

  // set cam on start position and look a bit right
  camera.position.set(startPoint.x, startPoint.y, startPoint.z);
  camera.lookAt(new THREE.Vector3(0, headHeight, 0));

  // register key events
  window.addEventListener("keydown", event => {
    switch (event.key) {
      case "w" || "W":
        isWalking.forward = true;
        break;
      case "s" || "S":
        isWalking.backward = true;
        break;
      case "a" || "A":
        isWalking.left = true;
        break;
      case "d" || "D":
        isWalking.right = true;
        break;
    }
  });

  window.addEventListener("keyup", event => {
    switch (event.key) {
      case "w" || "W":
        isWalking.forward = false;
        break;
      case "s" || "S":
        isWalking.backward = false;
        break;
      case "a" || "A":
        isWalking.left = false;
        break;
      case "d" || "D":
        isWalking.right = false;
        break;
    }
  });
  createPlayer();
}

/**
 * @param {THREE.Vector3} position
 * @param {THREE.Vector3} lookAt
 * @param {number} distance
 * @param { { forward: boolean, backward: boolean, left: boolean, right: boolean } } isWalking
 */
function getNewPosition(position, lookAt, distance, isWalking) {
  const newPosition = new THREE.Vector3(position.x, position.y, position.z);

  // check if two keys are pressed at the same time
  if ((isWalking.forward && (isWalking.left || isWalking.right)) || (isWalking.backward && (isWalking.left || isWalking.right))) {
    distance = distance / 2;
  }

  if (isWalking.forward === true) {
    newPosition.add(lookAt.clone().multiplyScalar(distance));
  }

  if (isWalking.backward === true) {
    newPosition.add(lookAt.clone().multiplyScalar(-distance));
  }

  if (isWalking.left === true) {
    newPosition.add(
      lookAt
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), degToRad(90))
        .multiplyScalar(distance)
    );
  }

  if (isWalking.right === true) {
    newPosition.add(
      lookAt
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), degToRad(-90))
        .multiplyScalar(distance)
    );
  }

  newPosition.y = position.y;
  return newPosition;
}

function degToRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * @param {THREE.PerspectiveCamera} cam
 */
function getCameraLookAt(cam) {
  var vector = new THREE.Vector3(0, 0, -1);
  vector.applyQuaternion(cam.quaternion);
  return vector;
}

function createPlayer() {
  const playerGeometry = new THREE.BoxGeometry(playerWidth, headHeight, playerWidth);
  const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(startPoint.x, headHeight / 2 + 0, startPoint.z);
  scene.add(player);
  myObjects.player = player;
}

/**
 * @param {THREE.Mesh} mesh1
 * @param {THREE.Mesh} mesh2
 */
function checkCollision(mesh1, mesh2) {
  const box1 = new THREE.Box3().setFromObject(mesh1);
  const box2 = new THREE.Box3().setFromObject(mesh2);
  return box1.intersectsBox(box2);
}

function handleWalking() {

  // store previous position of player to check for collision
  const previousPosition = new THREE.Vector3(
    myObjects.player.position.x,
    myObjects.player.position.y,
    myObjects.player.position.z
  );
  let isCollision = false;

  // walk if the user is pressing a key
  if (isWalking.forward || isWalking.backward || isWalking.left || isWalking.right) {
    const newPosition = getNewPosition(
      myObjects.player.position,
      getCameraLookAt(camera),
      distancePerWalk,
      isWalking
    );
    myObjects.player.position.set(newPosition.x, newPosition.y, newPosition.z);
  }

  // check if the player is inside a mesh
  let allMeshs = getAllMeshsFromNestedGroup(scene);
  for (let i = 0; i < allMeshs.length; i++) {
    if (allMeshs[i] !== myObjects.player) {
      if (checkCollision(myObjects.player, allMeshs[i])) {
        isCollision = true;
        break;
      }
    }
  }

  // if the player is inside a mesh, set the position back to the previous position
  if (isCollision === true) {
    myObjects.player.position.set(
      previousPosition.x,
      previousPosition.y,
      previousPosition.z
    );
  }

  // update the camera position
  camera.position.set(
    myObjects.player.position.x,
    headHeight,
    myObjects.player.position.z
  );
}

function initMouseClickMove() {

  window.addEventListener("mousedown", event => {
    isMouseDown = true;
  });

  window.addEventListener("mouseup", event => {
    isMouseDown = false;
  });

  window.addEventListener("mousemove", event => {
    if (!isMouseDown) return;
    isMovingCamera = true;
    camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), event.movementX * mouseRotateSpeed);
    camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), event.movementY * mouseRotateSpeed);
  });

  window.addEventListener("wheel", event => {
    const delta = Math.sign(event.deltaY);
    if ((camera.fov + delta * mouseZoomSpeed) < 135 && (camera.fov + delta * mouseZoomSpeed) > 20) {
      camera.fov += delta * mouseZoomSpeed;
      camera.updateProjectionMatrix();
    }
  });

}