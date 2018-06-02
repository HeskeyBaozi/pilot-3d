import { Collapse, InputNumber, Select, Slider, Switch } from 'antd';
import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { SyntheticEvent } from 'react';
import { autumn, summer } from '../stores';
import { IColorsStore } from '../stores/Colors';
import { ISceneStore } from '../stores/Scene';
import { UIStoreType } from '../stores/UI';
import styles from './Panel.less';

const Option = Select.Option;

interface IPanelProps {
  $colors?: IColorsStore;
  $scene?: ISceneStore;
  $ui?: UIStoreType;
}

@inject('$colors', '$scene', '$ui')
@observer
export default class Panel extends React.Component<IPanelProps> {

  @observable
  panelFixedStyle = {
    top: 20,
    left: 20
  };

  @observable
  opacity = 80;

  @computed
  get panelStyle() {
    const { $ui } = this.props;
    return {
      ...this.panelFixedStyle,
      top: this.panelFixedStyle.top + 'px',
      left: this.panelFixedStyle.left + 'px',
      opacity: this.opacity / 100,
      display: $ui!.isDebug ? 'block' : 'none'
    };
  }

  @action
  handlePanelTopChange = (top?: number | string) => {
    if (typeof top === 'number') {
      this.panelFixedStyle.top = top;
    }
  }

  @action
  handlePanelLeftChange = (left?: number | string) => {
    if (typeof left === 'number') {
      this.panelFixedStyle.left = left;
    }
  }

  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    this.props.$colors!.modifyColor(e.currentTarget.name, e.currentTarget.value);
  }

  handleCameraPositionXChange = (val?: number | string) => {
    if (typeof val === 'number') {
      const { $scene } = this.props;
      $scene!.updateCameraPosition({
        x: val,
        y: $scene!.camera.position.y,
        z: $scene!.camera.position.z
      });
    }
  }

  handleCameraPositionYChange = (val?: number | string) => {
    if (typeof val === 'number') {
      const { $scene } = this.props;
      $scene!.updateCameraPosition({
        x: $scene!.camera.position.x,
        y: val,
        z: $scene!.camera.position.z
      });
    }
  }

  handleCameraPositionZChange = (val?: number | string) => {
    if (typeof val === 'number') {
      const { $scene } = this.props;
      $scene!.updateCameraPosition({
        x: $scene!.camera.position.x,
        y: $scene!.camera.position.y,
        z: val
      });
    }
  }

  handleChangeColorsConfig = (val: any, option: any) => {
    const { $colors } = this.props;
    switch (val) {
      case 'summer':
        $colors!.useSummer();
        break;
      case 'autumn':
        $colors!.useAutumn();
        break;
    }
  }

  @action
  handleOpacitySliderChange = (val: any) => {
    this.opacity = val;
  }

  @computed
  get ColorsList() {
    return this.props.$colors!.list.map(({ name, value }) => {
      return (
        <div key={ name }>
          <input name={ name } type={ 'color' } value={ value } onChange={ this.handleChange }/>
          <span style={ { marginLeft: '.5rem' } }>{ name }</span>
        </div>
      );
    });
  }

  @computed
  get Scene() {
    const { $scene } = this.props;
    return (
      <div>
        <span>Camera</span>
        <div className={ styles.list }>
          <span>Position</span>
          <span>X</span>
          <InputNumber
            min={ -1000 }
            max={ 1000 }
            step={ 20 }
            value={ $scene!.camera.position.x }
            onChange={ this.handleCameraPositionXChange }
          />
          <span>Y</span>
          <InputNumber
            min={ -1000 }
            max={ 1000 }
            step={ 20 }
            value={ $scene!.camera.position.y }
            onChange={ this.handleCameraPositionYChange }
          />
          <span>Z</span>
          <InputNumber
            min={ -1000 }
            max={ 1000 }
            step={ 20 }
            value={ $scene!.camera.position.z }
            onChange={ this.handleCameraPositionZChange }
          />
        </div>
        <span>View</span>
        <div className={ styles.list }>
          <span style={ { marginRight: '1rem' } }>Horizontal View (Press Space)</span>
          <Switch checked={ $scene!.basic.isFPS }/>
        </div>
      </div>
    );
  }

  render() {
    const { $scene } = this.props;
    return (
      <div style={ this.panelStyle } key={ 'panel' } className={ styles.panel }>
        <Collapse accordion={ true }>
          <Collapse.Panel key={ 'panel-position' } header={ 'Panel Position' }>
            <span style={ { marginRight: '1rem' } }>
              Top
              <InputNumber
                min={ 0 }
                max={ 1000 }
                step={ 20 }
                style={ { margin: '0 .3rem' } }
                value={ this.panelFixedStyle.top }
                onChange={ this.handlePanelTopChange }
              />
            </span>
            <span>
              Left
              <InputNumber
                min={ 0 }
                max={ 1000 }
                step={ 20 }
                style={ { margin: '0 .3rem' } }
                value={ this.panelFixedStyle.left }
                onChange={ this.handlePanelLeftChange }
              />
            </span>
            <div>
              <span>Opacity</span>
              <Slider
                min={ 10 }
                max={ 100 }
                value={ this.opacity }
                onChange={ this.handleOpacitySliderChange }
              />
            </div>
          </Collapse.Panel>
          <Collapse.Panel key={ 'colors' } header={ 'Colors' }>
            <div className={ styles.colorsList }>
              { this.ColorsList }
            </div>
            <Select
              size={ 'small' }
              defaultValue='summer'
              style={ { marginTop: '1rem' } }
              onChange={ this.handleChangeColorsConfig }
            >
              <Option value='summer'>Summer</Option>
              <Option value='autumn'>Autumn</Option>
            </Select>
          </Collapse.Panel>
          <Collapse.Panel key={ 'scene' } header={ 'Scene' }>
            { this.Scene }
          </Collapse.Panel>
          <Collapse.Panel key={ 'game' } header={ 'Game' }>
            <div>
              <span>Distance</span>
              <span>{ $scene!.game.distance.toFixed(3) }</span>
              <span style={ { marginLeft: '1rem' } }>Game Speed</span>
              <span>{ $scene!.game.speed.toFixed(3) }</span>
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}
