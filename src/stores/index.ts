import { ColorsStore } from './Colors';
import { SceneStore } from './Scene';

const $colors = ColorsStore.create({
  planeCockPit: '#f25346',
  cloud: '#d8d0d1',
  planeEngine: '#d8d0d1',
  brown: '#59332e',
  pink: '#F5986E',
  brownDark: '#23190f',
  sea: '#68c3c0',
  day1: '#e4e0ba',
  day2: '#f7d9aa',
  dayFog: '#f7d9aa',
  night1: '#a683d8',
  night2: '#62a8e1',
  nightFog: '#ffffff'
});

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
      SeaRotationSpeed: 0.005,
      SkyRotationSpeed: 0.01,
      AirPlanePropellerRotationSpeed: 0.3
    }
  }, { $colors })
};
