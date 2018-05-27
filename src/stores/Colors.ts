import { types } from 'mobx-state-tree';

export const ColorsStore = types
  .model('Colors', {
    planeBody: types.string,
    cloud: types.string,
    planeEngine: types.string,
    planePropeller: types.string,
    pink: types.string,
    planeBlade: types.string,
    sea: types.string,
    day1: types.string,
    day2: types.string,
    dayFog: types.string,
    night1: types.string,
    night2: types.string,
    nightFog: types.string
  })
  .views((self: { [key: string]: string }) => ({
    get list(): Array<{ name: string, value: string }> {
      return Object.keys(self).map((key) => {
        return {
          name: key,
          value: self[ key ]
        };
      });
    }
  }))
  .actions((self: { [key: string]: string }) => ({
    modifyColor(name: string, value: string) {
      self[ name ] = value;
    }
  }));

type ColorsStoreType = typeof ColorsStore.Type;

type ColorsSnapShotType = typeof ColorsStore.SnapshotType;

export interface IColorsStore extends ColorsStoreType {
}

export interface IColorsSnapShot extends ColorsSnapShotType {
}
