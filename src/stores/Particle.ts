import * as TWEEN from '@tweenjs/tween.js';
import { getEnv, types } from 'mobx-state-tree';
import * as THREE from 'three';
import { IColorsSnapShot, IColorsStore } from './Colors';

export const ParticleStore = types
  .model('Particle', {})
  .volatile((self) => {
    const geom = new THREE.TetrahedronGeometry(3, 0);
    const mat = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self as any).$colors.enemy,
      shininess: 0,
      specular: '#ffffff',
      flatShading: true
    });
    const mesh = new THREE.Mesh(geom, mat);
    return {
      mesh
    };
  })
  .actions((self) => ({
    updateColor($colors: IColorsSnapShot) {
      if (!Array.isArray(self.mesh.material)) {
        self.mesh.material.setValues({
          color: $colors.cloud
        } as any);
      }
    },
    explode(pos: THREE.Vector3, color: string, scale: number, onComplete: () => void) {
      if (!Array.isArray(self.mesh.material)) {
        self.mesh.material.setValues({
          color
        } as any);
      }
      self.mesh.scale.set(scale, scale, scale);
      const targetX = pos.x + (-1 + Math.random() * 2) * 50;
      const targetY = pos.y + (-1 + Math.random() * 2) * 50;
      const targetZ = pos.z + (-1 + Math.random() * 2) * 50;
      const speed = .6 + Math.random() * 2;

      new TWEEN.Tween(self.mesh.rotation)
        .to({
          x: Math.random() * 12,
          y: Math.random() * 12
        }, 300)
        .onUpdate(({ x, y }) => {
          self.mesh.rotation.x = x;
          self.mesh.rotation.y = y;
        })
        .start();

      new TWEEN.Tween(self.mesh.scale)
        .to({ x: .1, y: .1, z: .1 }, 300)
        .onUpdate(({ x, y, z }) => {
          self.mesh.scale.set(x, y, z);
        })
        .start();

      new TWEEN.Tween(self.mesh.position)
        .to({ x: targetX, y: targetY, z: targetZ }, 300)
        .onUpdate(({ x, y, z }) => {
          self.mesh.position.set(x, y, z);
        })
        .onComplete(() => {
          if (self.mesh.parent) {
            self.mesh.parent.remove(self.mesh);
          }
          self.mesh.scale.set(1, 1, 1);
          onComplete();
        })
        .start();
    }
  }));

export type ParticleStoreType = typeof ParticleStore.Type;

export const ParticlesHolder = types
  .model('ParticlesHolder', {})
  .volatile((self) => {
    const mesh = new THREE.Object3D();
    const particlesInUse: ParticleStoreType[] = [];
    return {
      mesh, particlesInUse
    };
  })
  .actions((self) => {
    return ({
      spawnParticles(pos: THREE.Vector3, density: number,
                     color: string, scale: number, particlesPool: ParticleStoreType[]) {
        for (let i = 0; i < density; i++) {
          let particle: ParticleStoreType;
          particle = particlesPool.length ? particlesPool.pop() as ParticleStoreType
            : ParticleStore.create({}, getEnv<{ $colors: IColorsStore }>(self));
          self.mesh.add(particle.mesh);
          particle.mesh.visible = true;
          particle.mesh.position.x = pos.x;
          particle.mesh.position.y = pos.y;
          particle.mesh.position.z = pos.z;
          particle.explode(pos, color, scale, () => {
            particlesPool.unshift(particle);
          });
        }

      }
    });
  });

export type ParticlesHolderType = typeof ParticlesHolder.Type;
