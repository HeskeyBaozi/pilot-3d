import { getEnv, types } from 'mobx-state-tree';
import * as THREE from 'three';
import { IColorsStore } from './Colors';
import { ISeaStore } from './Sea';

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
      SeaRotationSpeed: types.number
    })
  })
  .views((self) => ({
    get cameraAspectRatio() {
      if (self.container.width && self.container.height) {
        return self.container.width / self.container.height;
      }
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

    return {
      cameraRef, renderer, scene
    };
  })
  .actions((self) => {
    let seaRef: ISeaStore;

    return {
      updateSize(width: number, height: number) {
        self.container.width = width;
        self.container.height = height;
        self.renderer.setSize(width, height);
        self.cameraRef.aspect = width / height;
        self.cameraRef.updateProjectionMatrix();
      },
      updateCameraPosition({ x, y, z }: { x: number, y: number, z: number }) {
        self.camera.position = { x, y, z };
        self.cameraRef.position.set(x, y, z);
      },
      addSea(sea: ISeaStore) {
        seaRef = sea;
        sea.mesh.position.y = -600;
        self.scene.add(sea.mesh);
      },
      loop() {
        (function innerLoop() {
          if (window && window.requestAnimationFrame) {
            if (seaRef) {
              seaRef.mesh.rotation.z += self.basic.SeaRotationSpeed;
            }
            self.renderer.render(self.scene, self.cameraRef);
            window.requestAnimationFrame(innerLoop);
          }
        })();
      }
    };
  });

type SceneStoreType = typeof SceneStore.Type;

export interface ISceneStore extends SceneStoreType {
}
