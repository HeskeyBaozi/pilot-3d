import { ColorsStore, IColorsSnapShot } from './Colors';
import { SceneStore } from './Scene';
import { UIStore } from './UI';

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
  enemy: '#d377f2',
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
  enemy: '#bce258',
  coin: '#009999'
};

const $colors = ColorsStore.create(summer);

export const stores = {
  $colors,
  $scene: SceneStore.create({
    camera: {
      position: { x: 0, y: 100, z: 200 },
      fieldOfView: 60
    },
    container: {
      width: null,
      height: null
    },
    basic: {
      isFPS: false
    },
    mouse: {
      position: { x: 0, y: 0 }
    },
    game: {
      status: 'ready'
    },
    global: {
      deltaTime: 0
    }
  }, { $colors }),
  $ui: UIStore.create({ isDebug: false })
};
