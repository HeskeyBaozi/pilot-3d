import { getEnv, types } from 'mobx-state-tree';
import * as THREE from 'three';
import { CloudStore, ICloudStore } from './Cloud';
import { IColorsSnapShot, IColorsStore } from './Colors';

export const SkyStore = types
  .model('Sky', {
    nClouds: types.number,
    baseHeight: types.number,
    deltaHeight: types.number,
    baseDepth: types.number,
    deltaDepth: types.number
  })
  .views((self) => ({
    get stepAngle() {
      return Math.PI * 2 / self.nClouds;
    }
  }))
  .volatile((self) => {
    const mesh = new THREE.Object3D();
    const clouds: ICloudStore[] = [];
    for (let i = 0; i < self.nClouds; i++) {
      const c = CloudStore.create({
        geometry: { size: 20 }
      }, getEnv<{ $colors: IColorsStore }>(self as any));

      const angle = self.stepAngle * i;
      const height = self.baseHeight - self.deltaHeight
        + 2 * Math.random() * self.deltaHeight;
      c.mesh.position.y = Math.sin(angle) * height;
      c.mesh.position.x = Math.cos(angle) * height;
      c.mesh.rotation.z = angle + Math.PI / 2;

      c.mesh.position.z = self.baseDepth - self.deltaDepth
        + 2 * Math.random() * self.deltaDepth;

      const s = 1 + Math.random() * 2;
      c.mesh.scale.set(s, s, s);
      clouds.push(c);
    }
    mesh.add(...clouds.map((store) => store.mesh));
    return {
      mesh, clouds
    };
  })
  .actions((self) => ({
    updateColors($colors: IColorsSnapShot) {
      self.clouds.forEach((cloud) => {
        cloud.updateColors($colors);
      });
    }
  }));

type SkyStoreType = typeof SkyStore.Type;

export interface ISkyStore extends SkyStoreType {
}
