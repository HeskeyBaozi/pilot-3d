import { types } from 'mobx-state-tree';

export const ColorsStore = types
  .model('Colors', {
    red: types.string,
    white: types.string,
    brown: types.string,
    pink: types.string,
    brownDark: types.string,
    blue: types.string,
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

export interface IColorsStore extends ColorsStoreType {
}
