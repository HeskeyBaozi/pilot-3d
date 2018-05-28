import { ColorsStore, IColorsSnapShot } from './Colors';
import { SceneStore } from './Scene';

export const summer: IColorsSnapShot = {
  planeBody: '#ACBC65',
  cloud: '#FBAC33',
  planeEngine: '#FFD146',
  planePropeller: '#59332e',
  pink: '#F5986E',
  planeBlade: '#23190f',
  sea: '#be9a32',
  backgroundTop: '#e5f2e5',
  backgroundBottom: '#62c2b5',
  fog: '#f7d9aa',
  enemy: '#f25346',
  coin: '#009999'
};

export const autumn: IColorsSnapShot = {
  planeBody: '#F69277',
  cloud: '#E9AE8B',
  planeEngine: '#d8d0d1',
  planePropeller: '#59332e',
  pink: '#F5986E',
  planeBlade: '#23190f',
  sea: '#8DA9A5',
  backgroundTop: '#D5D7CC',
  backgroundBottom: '#F4D5B7',
  fog: '#f7d9aa',
  enemy: '#f25346',
  coin: '#009999'
};

const $colors = ColorsStore.create(summer);

export const stores = {
  $colors,
  $scene: SceneStore.create({
    camera: {
      position: { x: 0, y: 100, z: 200 },
      fieldOfView: 60,
      nearPlane: 1,
      farPlane: 10000
    },
    container: {
      width: null,
      height: null
    },
    fog: {
      nearPlane: 100,
      farPlane: 950
    },
    lights: {
      hemisphere: {
        skyColor: '#aaaaaa',
        groundColor: '#000000',
        intensity: 0.9
      },
      directional: {
        color: '#ffffff',
        intensity: 0.9,
        position: { x: 150, y: 360, z: 350 }
      }
    },
    basic: {
      isNight: false,
      isFPS: false,
      SeaRotationSpeed: 0.005,
      SkyRotationSpeed: 0.01,
      AirPlanePropellerRotationSpeed: 0.3
    },
    mouse: {
      position: { x: 0, y: 0 }
    },
    plane: {
      collisionSpeed: { x: 0, y: 0 }
    },
    game: {},
    global: {
      deltaTime: 0
    }
  }, { $colors })
};
