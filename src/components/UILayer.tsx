import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IColorsStore } from '../stores/Colors';
import { ISceneStore } from '../stores/Scene';
import styles from './UILayer.less';

interface IUILayerProps {
  $scene?: ISceneStore;
  $colors?: IColorsStore;
}

@inject('$scene', '$colors')
@observer
export default class UILayer extends React.Component<IUILayerProps> {
  @computed
  get titleStyle() {
    const { $colors, $scene } = this.props;
    const base = {
      color: $colors!.planeBody,
      fontSize: '2rem'
    };
    if ($scene!.game.status !== 'playing') {
      Object.assign(base, {
        fontSize: '4rem'
      });
    }
    return base;
  }

  @computed
  get noticeText() {
    switch (this.props.$scene!.game.status) {
      case 'ready':
        return `Press "Enter" to play the game.`;
      case 'playing':
        return 'Avoid the enemies.';
      case 'failed':
        return 'Game Over';
      case 'waitingForReplay':
        return `Game Over, Press "Enter" to play the game again.`;
    }
  }

  @computed
  get Info() {
    if (this.props.$scene!.game.status === 'ready') {
      return (
        <div className={ styles.info }>
          <p>快捷键 Q：显示控制面板</p>
          <p>快捷键 1/2：分别显示两种皮肤</p>
          <p>快捷键 空格：切换视角</p>
          <p>鼠标滚轮调整镜头远近</p>
          <p>按回车开始</p>
        </div>
      );
    }
  }

  render() {
    const { $scene } = this.props;
    return (
      <div className={ styles.layerContainer }>
        <h1 style={ this.titleStyle } className={ styles.title }>Pilot3D</h1>
        <h2 className={ styles.distance }>
          { $scene!.game.distance.toFixed(1) }
          <span className={ styles.unit }>M</span>
        </h2>
        <div className={ styles.notice }>{ this.noticeText }</div>
        { this.Info }
      </div>
    );
  }
}
