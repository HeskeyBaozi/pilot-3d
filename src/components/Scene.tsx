import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import { onSnapshot } from 'mobx-state-tree';
import React, { MouseEventHandler, WheelEventHandler } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import * as THREE from 'three';
import { AirPlaneStore } from '../stores/AirPlane';
import { IColorsStore } from '../stores/Colors';
import { EnemiesHolder } from '../stores/Enemy';
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
    window.onkeydown = this.handleKeyDown;
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
    const sky = SkyStore.create({
      nClouds: 30,
      baseHeight: 950,
      deltaHeight: 100,
      baseDepth: 0,
      deltaDepth: 400
    }, { $colors });
    const airPlane = AirPlaneStore.create({}, { $colors });
    const enemiesHolder = EnemiesHolder.create({ enemiesInUse: [] }, { $colors });

    $scene!.addSea(sea);
    $scene!.addSky(sky);
    $scene!.addAirPlane(airPlane);
    $scene!.addEnemiesHolder(enemiesHolder);
    onSnapshot($colors!, (colors) => {
      $scene!.updateColors(colors);
    });
    this.containerRef.current!.appendChild($scene!.renderer.domElement);
    $scene!.loop();
  }

  componentWillUnmount() {
    const { $scene } = this.props;
    $scene!.renderer.clear();
    window.onkeydown = null;
    this.containerRef.current!.removeChild($scene!.renderer.domElement);
  }

  onResize = (width: number, height: number) => {
    const { $scene } = this.props;
    $scene!.updateSize(width, height);
  }

  @computed
  get containerStyle() {
    const { $colors } = this.props;
    const image = `linear-gradient(${$colors!.backgroundTop}, ${$colors!.backgroundBottom})`;
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

  handleKeyDown = (e: any) => {
    if (e.keyCode === 32) {
      const { $scene } = this.props;
      $scene!.toggleFPS();
    }
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
