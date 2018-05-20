import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { IColorsStore } from '../stores/Colors';
import styles from './Scene.less';

interface IPilotSceneProps {
  $colors?: IColorsStore;
}

@inject('$colors')
@observer
export default class PilotScene extends React.Component<IPilotSceneProps> {

  onResize = (width: number, height: number) => {
    console.log(width, height);
  }

  @computed
  get isDay() {
    return false;
  }

  @computed
  get containerStyle() {
    const { $colors } = this.props;
    const image = this.isDay ?
      `linear-gradient(${$colors!.day1}, ${$colors!.day2})` :
      `linear-gradient(${$colors!.night1}, ${$colors!.night2})`;
    return {
      backgroundImage: image
    };
  }

  render() {
    return (
      <div key={ 'canvas-container' } style={ this.containerStyle } className={ styles.container }>
        Canvas Container
        <ReactResizeDetector
          key={ 'resize-detector' }
          handleWidth={ true }
          handleHeight={ true }
          onResize={ this.onResize }
          refreshMode={ 'throttle' }
          refreshRate={ 300 }
        />
      </div>
    );
  }
}
