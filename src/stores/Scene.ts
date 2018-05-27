import * as TWEEN from '@tweenjs/tween.js';
import { getEnv, types } from 'mobx-state-tree';
import * as THREE from 'three';
import { IAirPlaneStore } from './AirPlane';
import { IColorsSnapShot, IColorsStore } from './Colors';
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
      SeaRotationSpeed: types.number,
      SkyRotationSpeed: types.number,
      AirPlanePropellerRotationSpeed: types.number
    }),
    mouse: types.model('Mouse', {
      position: types.model({
        x: types.number,
        y: types.number
      })
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
    const fogColor = self.basic.isNight && getEnv<{ $colors: IColorsStore }>(self).$colors.nightFog
      || getEnv<{ $colors: IColorsStore }>(self).$colors.dayFog || '#ffffff';
    scene.fog = new THREE.Fog(Number.parseInt((fogColor).slice(1), 16), self.fog.nearPlane, self.fog.farPlane);

    const hemisphereLight = new THREE.HemisphereLight(
      self.lights.hemisphere.skyColor,
      self.lights.hemisphere.groundColor,
      self.lights.hemisphere.intensity
    );

    const ambientLight = new THREE.AmbientLight('#fff', .2);

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
    scene.add(ambientLight);

    const objects: {
      seaRef?: ISeaStore,
      skyRef?: ISkyStore,
      airPlaneRef?: IAirPlaneStore
    } = {};

    return {
      cameraRef, renderer, scene, objects
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
          self.basic.isNight ? ($colors.nightFog as any) : ($colors.dayFog as any),
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
      loop() {
        (function innerLoop() {
          if (window && window.requestAnimationFrame) {
            if (self.objects.seaRef
              && self.objects.skyRef
              && self.objects.airPlaneRef) {
              const targetY = normalize(self.standardMousePosition.y, -.75, .75, 25, 175);
              self.objects.seaRef.moveWaves(self.basic.SeaRotationSpeed);
              self.objects.skyRef.mesh.rotation.z += self.basic.SkyRotationSpeed;
              self.objects.airPlaneRef.mesh.position.y += (targetY - self.objects.airPlaneRef.mesh.position.y) * 0.1;
              self.objects.airPlaneRef.mesh.rotation.z = (targetY - self.objects.airPlaneRef.mesh.position.y) * 0.0128;
              self.objects.airPlaneRef.mesh.rotation.x = (self.objects.airPlaneRef.mesh.position.y - targetY) * 0.0064;
              self.objects.airPlaneRef.propeller.rotation.x += self.basic.AirPlanePropellerRotationSpeed;
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
