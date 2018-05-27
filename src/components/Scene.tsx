import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import { onAction, onSnapshot } from 'mobx-state-tree';
import React, { MouseEventHandler, WheelEventHandler } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import * as THREE from 'three';
import { AirPlaneStore } from '../stores/AirPlane';
import { IColorsStore } from '../stores/Colors';
import { ISceneStore } from '../stores/Scene';
import { SeaStore } from '../stores/Sea';
import { SkyStore } from '../stores/Sky';
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
      },
      waves: {
        baseAmp: 12.5,
        deltaAmp: 7.5,
        baseSpeed: 0.014,
        deltaSpeed: 0.008
      }
    }, { $colors });
    $scene!.addSea(sea);
    const sky = SkyStore.create({
      nClouds: 20,
      baseHeight: 850,
      deltaHeight: 100,
      baseDepth: -200,
      deltaDepth: 200
    }, { $colors });
    $scene!.addSky(sky);
    const airPlane = AirPlaneStore.create({}, { $colors });
    $scene!.addAirPlane(airPlane);
    onSnapshot($colors!, (colors) => {
      $scene!.updateColors(colors);
    });
    this.containerRef.current!.appendChild($scene!.renderer.domElement);
    $scene!.loop();
  }

  componentWillUnmount() {
    const { $scene } = this.props;
    $scene!.renderer.clear();
    this.containerRef.current!.removeChild($scene!.renderer.domElement);
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

  handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    const { $scene } = this.props;
    $scene!.updateMousePosition({ x: e.clientX, y: e.clientY });
  }

  handleWheel: WheelEventHandler<HTMLDivElement> = (e) => {
    const { $scene } = this.props;
    $scene!.updateCameraFov(e.deltaY);
  }

  render() {
    return (
      <div
        key={ 'canvas-container' }
        style={ this.containerStyle }
        ref={ this.containerRef }
        className={ styles.container }
        onMouseMove={ this.handleMouseMove }
        onWheel={ this.handleWheel }
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
