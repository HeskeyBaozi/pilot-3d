import * as TWEEN from '@tweenjs/tween.js';
import { applyAction, getEnv, types } from 'mobx-state-tree';
import * as THREE from 'three';
import { IAirPlaneStore } from './AirPlane';
import { IColorsSnapShot, IColorsStore } from './Colors';
import { EnemiesHolderType, EnemyStore, EnemyStoreType } from './Enemy';
import { ISeaStore } from './Sea';
import { ISkyStore } from './Sky';

export const SceneStore = types
  .model('Scene', {
    camera: types.model('CameraConfig', {
      position: types.model({
        x: types.number,
        y: types.number,
        z: types.number
      }),
      fieldOfView: types.number,
      nearPlane: types.number,
      farPlane: types.number
    }),
    container: types.model('ContainerConfig', {
      width: types.maybe(types.number),
      height: types.maybe(types.number)
    }),
    fog: types.model('Fog', {
      nearPlane: types.number,
      farPlane: types.number
    }),
    lights: types.model('Lights', {
      hemisphere: types.model('Hemisphere', {
        skyColor: types.string,
        groundColor: types.string,
        intensity: types.number
      }),
      directional: types.model('Directional', {
        color: types.string,
        intensity: types.number,
        position: types.model('shadowLightPosition', {
          x: types.number,
          y: types.number,
          z: types.number
        })
      })
    }),
    basic: types.model('Basic', {
      isNight: types.boolean,
      isFPS: types.boolean,
      SeaRotationSpeed: types.number,
      SkyRotationSpeed: types.number,
      AirPlanePropellerRotationSpeed: types.number
    }),
    mouse: types.model('Mouse', {
      position: types.model({
        x: types.number,
        y: types.number
      })
    }),
    plane: types.model('Plane', {
      collisionSpeed: types.model({
        x: types.number,
        y: types.number
      })
    }),
    game: types.model('Game', {
      speed: 0,
      initSpeed: .00035,
      baseSpeed: .00035,
      targetBaseSpeed: .00035,
      incrementSpeedByTime: .0000025,
      incrementSpeedByLevel: .000005,
      distanceForSpeedUpdate: 100,
      speedLastUpdate: 0,

      distance: 0,
      ratioSpeedDistance: 50,
      energy: 100,
      ratioSpeedEnergy: 3,

      level: 1,
      levelLastUpdate: 0,
      distanceForLevelUpdate: 1000,

      planeDefaultHeight: 100,
      planeAmpHeight: 80,
      planeAmpWidth: 75,
      planeMoveSensitivity: 0.005,
      planeRotXSensitivity: 0.0008,
      planeRotZSensitivity: 0.0004,
      planeFallSpeed: .001,
      planeMinSpeed: 1.2,
      planeMaxSpeed: 1.6,
      planeSpeed: 0,
      planeCollisionDisplacementX: 0,
      planeCollisionSpeedX: 0,

      planeCollisionDisplacementY: 0,
      planeCollisionSpeedY: 0,

      planeCollisionDisplacementZ: 0,
      planeCollisionSpeedZ: 0,

      seaRadius: 600,
      seaLength: 800,

      wavesMinAmp: 5,
      wavesMaxAmp: 20,
      wavesMinSpeed: 0.001,
      wavesMaxSpeed: 0.003,

      cameraFarPos: 500,
      cameraNearPos: 150,
      cameraSensitivity: 0.002,

      coinDistanceTolerance: 15,
      coinValue: 3,
      coinsSpeed: .5,
      coinLastSpawn: 0,
      distanceForCoinsSpawn: 100,

      enemyDistanceTolerance: 10,
      enemyValue: 10,
      enemiesSpeed: .6,
      enemyLastSpawn: 0,
      distanceForEnemiesSpawn: 50,

      status: 'playing'
    }),
    global: types.model('Global', {
      deltaTime: types.number
    })
  })
  .views((self) => ({
    get cameraAspectRatio() {
      if (self.container.width && self.container.height) {
        return self.container.width / self.container.height;
      }
    },
    get standardMousePosition() {
      if (self.container.width && self.container.height) {
        return {
          x: -1 + (self.mouse.position.x / self.container.width) * 2,
          y: 1 - (self.mouse.position.y / self.container.height) * 2
        };
      }
      return { x: -1, y: 1 };
    }
  }))
  .volatile((self) => {

    const cameraRef = new THREE.PerspectiveCamera(
      self.camera.fieldOfView,
      self.cameraAspectRatio,
      self.camera.nearPlane,
      self.camera.farPlane
    );
    cameraRef.position.x = self.camera.position.x;
    cameraRef.position.y = self.camera.position.y;
    cameraRef.position.z = self.camera.position.z;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    const fogColor = getEnv<{ $colors: IColorsStore }>(self).$colors.fog || '#ffffff';
    scene.fog = new THREE.Fog(Number.parseInt((fogColor).slice(1), 16), self.fog.nearPlane, self.fog.farPlane);

    const hemisphereLight = new THREE.HemisphereLight(
      self.lights.hemisphere.skyColor,
      self.lights.hemisphere.groundColor,
      self.lights.hemisphere.intensity
    );

    const ambientLightRef = new THREE.AmbientLight('#fff', .2);

    const shadowLight = new THREE.DirectionalLight(
      self.lights.directional.color,
      self.lights.directional.intensity
    );

    shadowLight.position.set(
      self.lights.directional.position.x,
      self.lights.directional.position.y,
      self.lights.directional.position.z
    );

    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(ambientLightRef);

    const objects: {
      seaRef?: ISeaStore,
      skyRef?: ISkyStore,
      airPlaneRef?: IAirPlaneStore,
      enemiesHolderRef?: EnemiesHolderType
    } = {};

    const enemiesPool: EnemyStoreType[] = [];
    const particlesPool: any[] = [];
    const particlesInUse: any[] = [];

    return {
      cameraRef, ambientLightRef, renderer, scene, objects,
      enemiesPool,
      particlesPool,
      particlesInUse
    };
  })
  .actions((self) => {
    return {
      updateSize(width: number, height: number) {
        self.container.width = width;
        self.container.height = height;
        self.renderer.setSize(width, height);
        self.cameraRef.aspect = width / height;
      },
      updateMousePosition({ x, y }: { x: number, y: number }) {
        self.mouse.position.x = x;
        self.mouse.position.y = y;
      },
      updateCameraPosition({ x, y, z }: { x: number, y: number, z: number }) {
        self.camera.position = { x, y, z };
        self.cameraRef.position.set(x, y, z);
      },
      updateCameraFov(delta: number) {
        let final = self.cameraRef.fov + normalize(delta, -100, 100, -20, 20);
        final = Math.max(40, final);
        final = Math.min(80, final);
        new TWEEN.Tween({ delta: self.cameraRef.fov })
          .to({ delta: final }, 500)
          .onUpdate(({ delta: val }) => {
            self.cameraRef.fov = val;
          })
          .start();
      },
      updateColors($colors: IColorsSnapShot) {
        self.scene.fog = new THREE.Fog(
          ($colors.fog as any),
          self.fog.nearPlane, self.fog.farPlane
        );
        if (self.objects.seaRef
          && self.objects.skyRef
          && self.objects.airPlaneRef) {
          if (!Array.isArray(self.objects.seaRef.mesh.material)) {
            self.objects.seaRef.mesh.material.setValues({
              color: $colors.sea
            } as any);
          }
          self.objects.skyRef.updateColors($colors);
          self.objects.airPlaneRef.updateColors($colors);
        }
      },
      toggleFPS() {
        self.basic.isFPS = !self.basic.isFPS;
        if (self.basic.isFPS) {
          self.game.enemyLastSpawn = 50;
          new TWEEN.Tween({ x: self.objects.airPlaneRef!.mesh.position.x })
            .to({ x: 0 }, 200)
            .onUpdate(({ x }) => {
              self.objects.airPlaneRef!.mesh.position.x = x;
            })
            .start();
          new TWEEN.Tween(self.cameraRef.position)
            .to({ x: -150, y: 100, z: 0 }, 500)
            .onUpdate(({ x, y, z }) => {
              applyAction(self, {
                name: 'updateCameraPosition',
                args: [ { x, y, z } ]
              });
            })
            .start();
          new TWEEN.Tween(self.cameraRef.rotation)
            .to({ y: -Math.PI / 2 }, 500)
            .onUpdate(({ x, y, z }) => {
              self.cameraRef.rotation.set(x, y, z);
            })
            .start();
        } else {
          self.game.enemyLastSpawn = 100;
          new TWEEN.Tween({ z: self.objects.airPlaneRef!.mesh.position.z })
            .to({ z: 0 }, 200)
            .onUpdate(({ z }) => {
              self.objects.airPlaneRef!.mesh.position.z = z;
            })
            .start();
          new TWEEN.Tween(self.cameraRef.position)
            .to({ x: 0, y: 100, z: 200 }, 500)
            .onUpdate(({ x, y, z }) => {
              applyAction(self, {
                name: 'updateCameraPosition',
                args: [ { x, y, z } ]
              });
            })
            .start();
          new TWEEN.Tween(self.cameraRef.rotation)
            .to({ y: 0 }, 500)
            .onUpdate(({ x, y, z }) => {
              self.cameraRef.rotation.set(x, y, z);
            })
            .start();
        }
      },
      addSea(sea: ISeaStore) {
        self.objects.seaRef = sea;
        sea.mesh.position.y = -600;
        self.scene.add(sea.mesh);
      },
      addSky(sky: ISkyStore) {
        self.objects.skyRef = sky;
        sky.mesh.position.y = -600;
        self.scene.add(sky.mesh);
      },
      addAirPlane(airPlane: IAirPlaneStore) {
        self.objects.airPlaneRef = airPlane;
        airPlane.mesh.scale.set(.25, .25, .25);
        airPlane.mesh.position.y = 100;
        self.scene.add(airPlane.mesh);
      },
      addEnemiesHolder(enemiesHolder: EnemiesHolderType) {
        self.objects.enemiesHolderRef = enemiesHolder;
        self.objects.enemiesHolderRef.spawnEnemies(15, self.enemiesPool);
        self.scene.add(enemiesHolder.mesh);
      },
      updateDistance() {
        self.game.distance += self.game.speed * self.global.deltaTime * self.game.ratioSpeedDistance;
      },
      updateDeltaTime(t: number) {
        self.global.deltaTime = t;
      },
      rotateEnemies() {
        if (self.objects.airPlaneRef
          && self.objects.enemiesHolderRef) {

          for (let i = 0; i < self.objects.enemiesHolderRef.enemiesInUse.length; i++) {
            const enemy = self.objects.enemiesHolderRef.enemiesInUse[ i ];
            enemy.setAngle(enemy.angle + self.game.speed * self.global.deltaTime * self.game.enemiesSpeed);
            if (enemy.angle > Math.PI * 2) {
              enemy.setAngle(enemy.angle - Math.PI * 2);
            }
            enemy.mesh.position.y = -600 + Math.sin(enemy.angle) * enemy.distance;
            enemy.mesh.position.x = Math.cos(enemy.angle) * enemy.distance;
            if (!self.basic.isFPS) {
              if (enemy.mesh.position.z !== 0) {
                new TWEEN.Tween({ z: enemy.mesh.position.z })
                  .to({ z: 0 }, 300)
                  .onUpdate(({ z }) => {
                    enemy.mesh.position.z = z;
                  })
                  .onComplete(() => enemy.mesh.position.z = 0)
                  .start();
              }
            } else {
              if (-150 <= enemy.mesh.position.z && enemy.mesh.position.z <= 150) {
                // noop
              } else {
                enemy.setZOffset(-enemy.zOffset);
              }
              enemy.mesh.position.z += enemy.zOffset;
            }
            enemy.mesh.rotation.z += Math.random() * 0.1;
            enemy.mesh.rotation.y += Math.random() * 0.1;

            const diffPosition = self.objects.airPlaneRef.mesh.position.clone().sub(enemy.mesh.position.clone());
            const d = diffPosition.length();
            if (d < 10) {
              // particlesHolder
              self.enemiesPool.unshift(self.objects.enemiesHolderRef.takeOneAt(i));
              self.objects.enemiesHolderRef.mesh.remove(enemy.mesh);
              self.game.planeCollisionSpeedX = 100 * diffPosition.x / d;
              self.game.planeCollisionSpeedY = 100 * diffPosition.y / d;
              self.game.planeCollisionSpeedZ = 100 * diffPosition.z / d;
              new TWEEN.Tween({ intensity: 1.5 })
                .to({ intensity: 0.2 }, 500)
                .onUpdate(({ intensity }) => self.ambientLightRef.intensity = intensity)
                .start();
              i--;
            } else if (enemy.angle > Math.PI) {
              self.enemiesPool.unshift(self.objects.enemiesHolderRef.takeOneAt(i));
              self.objects.enemiesHolderRef.mesh.remove(enemy.mesh);
              i--;
            }
          }
        }
      },
      spawnNewEnemies() {
        self.game.enemyLastSpawn = Math.floor(self.game.distance);
        self.objects.enemiesHolderRef!.spawnEnemies(15, self.enemiesPool);
      },
      updatePlane() {
        self.game.planeCollisionDisplacementX += self.game.planeCollisionSpeedX;
        self.game.planeCollisionDisplacementY += self.game.planeCollisionSpeedY;
        self.game.planeCollisionDisplacementZ += self.game.planeCollisionSpeedZ;
        if (!self.basic.isFPS) {
          self.game.planeSpeed = normalize(-self.standardMousePosition.x, -0.5, 0.5,
            self.game.planeMinSpeed, self.game.planeMaxSpeed);
          let targetY = normalize(self.standardMousePosition.y, -1, 1, 25, 175);
          let targetX = normalize(self.standardMousePosition.x, -1, 1, -150, 150);
          targetX += self.game.planeCollisionDisplacementX;
          targetY += self.game.planeCollisionDisplacementY;
          self.objects.airPlaneRef!.mesh.position.x +=
            (targetX - self.objects.airPlaneRef!.mesh.position.x) * 0.1;
          self.objects.airPlaneRef!.mesh.position.y +=
            (targetY - self.objects.airPlaneRef!.mesh.position.y) * 0.1;
          self.objects.airPlaneRef!.mesh.rotation.z
            = (targetY - self.objects.airPlaneRef!.mesh.position.y) * 0.0128;
          self.objects.airPlaneRef!.mesh.rotation.x
            = (self.objects.airPlaneRef!.mesh.position.y - targetY) * 0.0064;
        } else {
          self.game.planeSpeed = (self.game.planeMaxSpeed + self.game.planeMinSpeed) / 2;
          let targetY = normalize(self.standardMousePosition.y, -1, 1, 25, 150);
          let targetZ = normalize(self.standardMousePosition.x, -1, 1, -150, 150);
          targetY += self.game.planeCollisionDisplacementY;
          targetZ += self.game.planeCollisionDisplacementZ;
          self.objects.airPlaneRef!.mesh.position.z +=
            (targetZ - self.objects.airPlaneRef!.mesh.position.z) * 0.1;
          self.objects.airPlaneRef!.mesh.position.y +=
            (targetY - self.objects.airPlaneRef!.mesh.position.y) * 0.1;
          self.objects.airPlaneRef!.mesh.rotation.z
            = (targetY - self.objects.airPlaneRef!.mesh.position.y) * 0.0128;
          self.objects.airPlaneRef!.mesh.rotation.x
            = (self.objects.airPlaneRef!.mesh.position.y - targetY) * 0.0064;
        }

        self.game.planeCollisionSpeedX +=
          (0 - self.game.planeCollisionSpeedX) * self.global.deltaTime * 0.05;
        self.game.planeCollisionDisplacementX +=
          (0 - self.game.planeCollisionDisplacementX) * self.global.deltaTime * 0.01;
        self.game.planeCollisionSpeedY +=
          (0 - self.game.planeCollisionSpeedY) * self.global.deltaTime * 0.05;
        self.game.planeCollisionDisplacementY +=
          (0 - self.game.planeCollisionDisplacementY) * self.global.deltaTime * 0.01;
        self.game.planeCollisionSpeedZ +=
          (0 - self.game.planeCollisionSpeedZ) * self.global.deltaTime * 0.05;
        self.game.planeCollisionDisplacementZ +=
          (0 - self.game.planeCollisionDisplacementZ) * self.global.deltaTime * 0.01;
      },
      updatePlanePropeller() {
        self.objects.airPlaneRef!.propeller.rotation.x += 0.2 + self.game.planeSpeed * self.global.deltaTime * 0.005;
      },
      updatePlayingSpeed() {
        self.game.baseSpeed += (self.game.targetBaseSpeed - self.game.baseSpeed) * self.global.deltaTime * 0.02;
        self.game.speed = self.game.baseSpeed * self.game.planeSpeed;
      },
      updateSea() {
        self.objects.seaRef!.moveWaves();
        self.objects.seaRef!.mesh.rotation.z += self.game.speed * self.global.deltaTime;
        if (self.objects.seaRef!.mesh.rotation.z > 2 * Math.PI) {
          self.objects.seaRef!.mesh.rotation.z -= 2 * Math.PI;
        }
      },
      updateSky() {
        self.objects.skyRef!.mesh.rotation.z += self.game.speed * self.global.deltaTime;
      },
      loop() {
        let deltaTime = 0;
        let oldTime = 0;
        (function innerLoop(current?: number) {
          if (current) {
            deltaTime = current - oldTime;
            oldTime = current;
            applyAction(self, { name: 'updateDeltaTime', args: [ deltaTime ] });
          }
          if (window && window.requestAnimationFrame) {
            if (self.objects.seaRef
              && self.objects.skyRef
              && self.objects.airPlaneRef) {

              if (true) { // playing
                if (Math.floor(self.game.distance) % Math.floor(self.game.distanceForEnemiesSpawn) === 0
                  && Math.floor(self.game.distance) > self.game.enemyLastSpawn) {
                  applyAction(self, { name: 'spawnNewEnemies' });
                }

                applyAction(self, { name: 'updatePlane' });
                applyAction(self, { name: 'updateDistance' });
                applyAction(self, { name: 'updatePlayingSpeed' });
              }
              applyAction(self, { name: 'updateSea' });
              applyAction(self, { name: 'updateSky' });
              applyAction(self, { name: 'updatePlanePropeller' });
              applyAction(self, { name: 'rotateEnemies' });
            }

            self.renderer.render(self.scene, self.cameraRef);
            self.cameraRef.updateProjectionMatrix();
            TWEEN.update();
            window.requestAnimationFrame(innerLoop);
          }
        })();
      }
    };
  });

function normalize(v: number, vmin: number, vmax: number, tmin: number, tmax: number) {
  const nv = Math.max(Math.min(v, vmax), vmin);
  const dv = vmax - vmin;
  const pc = (nv - vmin) / dv;
  const dt = tmax - tmin;
  return tmin + (pc * dt);
}

type SceneStoreType = typeof SceneStore.Type;

export interface ISceneStore extends SceneStoreType {
}
