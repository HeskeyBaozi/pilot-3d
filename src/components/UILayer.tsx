import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './UILayer.less';

interface IUILayerProps {

}

@inject()
@observer
export default class UILayer extends React.Component<IUILayerProps> {
  render() {
    return (
      <div className={ styles.layerContainer }>
        <div>
          Header
        </div>
      </div>
    );
  }
}
