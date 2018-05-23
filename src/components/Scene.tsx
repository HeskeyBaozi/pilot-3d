import { computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { onAction, onPatch, onSnapshot } from 'mobx-state-tree';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import * as THREE from 'three';
import { IColorsStore } from '../stores/Colors';
import { ISceneStore, SceneStore } from '../stores/Scene';
import { SeaStore } from '../stores/Sea';
import styles from './Scene.less';

interface IPilotSceneProps {
  $colors?: IColorsStore;
  $scene?: ISceneStore;
}

@inject('$colors', '$scene')
@observer
export default class PilotScene extends React.Component<IPilotSceneProps> {

  containerRef = React.createRef<HTMLDivElement>();
  $scene?: ISceneStore;

  componentDidMount() {
    const { $colors, $scene } = this.props;
    $scene!.updateSize(this.containerRef.current!.offsetWidth, this.containerRef.current!.offsetHeight);
    const sea = SeaStore.create({
      geometry: {
        radiusTop: 600,
        radiusBottom: 600,
        height: 800,
        radiusSegments: 40,
        heightSegments: 10
      }
    });
    $scene!.addSea(sea);
    onSnapshot($colors!, ({ dayFog, nightFog }) => {
      $scene!.scene.fog = new THREE.Fog(
        $scene!.basic.isNight ? nightFog : dayFog,
        $scene!.fog.nearPlane,
        $scene!.fog.farPlane
      );
    });
    onAction($scene!, ({ name, args }) => {
      switch (name) {
        case '234':
          console.log(234);
          break;
      }
    });
    this.containerRef.current!.appendChild($scene!.renderer.domElement);
    $scene!.loop();
  }

  onResize = (width: number, height: number) => {
    const { $scene } = this.props;
    $scene!.updateSize(width, height);
  }

  @computed
  get containerStyle() {
    const { $colors } = this.props;
    const image = this.$scene && this.$scene!.basic.isNight ?
      `linear-gradient(${$colors!.night1}, ${$colors!.night2})` :
      `linear-gradient(${$colors!.day1}, ${$colors!.day2})`;
    return {
      backgroundImage: image
    };
  }

  render() {
    return (
      <div
        key={ 'canvas-container' }
        style={ this.containerStyle }
        ref={ this.containerRef }
        className={ styles.container }
      >
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
