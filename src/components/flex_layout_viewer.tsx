import * as React from 'react';
import {Limits} from '../graph';
import {Constraint, Rectangle} from '../rectangle';
import {getRectangleBorderStyles} from '../utilities';
import {Orientation} from './home_page';

interface Properties {
  rectangleMatrix: Rectangle[][];
  orientation: Orientation;
  limits: Limits;
}

interface State {
  isWidthEnabled: boolean;
  isHeightEnabled: boolean;
  width: number;
  height: number;
}

/** The flex layout viewer component. */
export class FlexLayoutViewer extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    const {minimumWidth, minimumHeight, maximumWidth, maximumHeight} = this.props.limits;
    const width = minimumWidth === maximumWidth ? minimumWidth : minimumWidth * 1.2;
    const height = minimumHeight === maximumHeight ? minimumHeight : minimumHeight * 1.2;
    this.state = {
      isWidthEnabled: false,
      isHeightEnabled: false,
      width,
      height
    };
  }

  public render(): JSX.Element {
    const isRow = this.props.orientation === Orientation.ROW;
    const [flexContainerDirection, flexDirection, gap, dim] = (() => {
      if(isRow) {
        return ['column' as 'column', 'row' as 'row', '1px 0', {width: '100%', columnGap: 1}];
      } else {
        return ['row' as 'row', 'column' as 'column', '0 1px', {height: '100%', rowGap: 1}];
      }
    })();
    const [widthLimit, heightLimit] = (() => {
      if(this.props.limits) {
        const {minimumWidth, minimumHeight, maximumWidth, maximumHeight} = this.props.limits;
        const width = `clamp(${minimumWidth}px, 100%, ${maximumWidth}px)`;
        const height = `clamp(${minimumHeight}px, 100%, ${maximumHeight}px)`;
        return [width, height];
      } else {
        return ['100%, 100%'];
      }
    })();
    const width = this.state.isWidthEnabled ? this.state.width : widthLimit;
    const height = this.state.isHeightEnabled ? this.state.height : heightLimit;
    return (
      <div style={FlexLayoutViewer.STYLE.wrapper}>
        <div style={{...FlexLayoutViewer.STYLE.container, width, height,
            flexDirection: flexContainerDirection, gap}}>
          {this.props.rectangleMatrix?.map((set, index) => {
            const isWidthFlexible = set.every(rect =>
              rect.horizontalPolicy === Constraint.FILL_SPACE);
            const isHeightFlexible = set.every(rect =>
              rect.verticalPolicy === Constraint.FILL_SPACE);
            const flex = (() => {
              if(isRow) {
                return (isHeightFlexible && '1 1 auto') || '0 0 auto';
              } else {
                return (isWidthFlexible && '1 1 auto') || '0 0 auto';
              }
            })();
            return (
              <div style={{display: 'flex', flexDirection, flex, ...dim}} key={index}>
                {set.map(this.renderRectangle)}
              </div>);
          })}
        </div>
        <div style={FlexLayoutViewer.STYLE.inputContainer}>
          <div style={FlexLayoutViewer.STYLE.inputGroup}>
            <input type='checkbox' checked={this.state.isWidthEnabled}
              onChange={this.onChangeWidthCheckbox}/>
            <label htmlFor='width' style={{marginRight: 5}}>Width</label>
            <input
              type='number'
              id='width'
              value={this.state.width}
              min={this.props.limits.minimumWidth} 
              max={this.props.limits.maximumWidth} 
              onChange={this.onChangeWidth}/>
          </div>
          <div style={FlexLayoutViewer.STYLE.inputGroup}>
            <input type='checkbox' checked={this.state.isHeightEnabled}
              onChange={this.onChangeHeightCheckbox}/>
            <label htmlFor='height' style={{marginRight: 5}}>Height</label>
            <input
              type='number'
              id='height'
              value={this.state.height}
              min={this.props.limits.minimumHeight} 
              max={this.props.limits.maximumHeight} 
              onChange={this.onChangeHeight}/>
          </div>
        </div>
      </div>);
  }

  private renderRectangle = (rectangle: Rectangle, index: number) => {
    const isConstraintUniform = rectangle.horizontalPolicy ===
      rectangle.verticalPolicy;
    const backgroundColor = (isConstraintUniform &&
      FlexLayoutViewer.CONSTRAINT_COLORS[rectangle.horizontalPolicy]) || '#F5F5F5';
    const extraStyle = getRectangleBorderStyles(rectangle);
    const isWidthFlexible = rectangle.horizontalPolicy === Constraint.FILL_SPACE;
    const isHeightFlexible = rectangle.verticalPolicy === Constraint.FILL_SPACE;
    const orientationStyle = (() => {
      if(this.props.orientation === Orientation.ROW) {
        return {
          flex: (isWidthFlexible && '1 1 auto') || '0 0 auto',
          height: (isHeightFlexible && 'auto') || rectangle.height
        };
      } else if(this.props.orientation === Orientation.COLUMN) {
        return {
          flex: (isHeightFlexible && '1 1 auto') || '0 0 auto',
          width: (isWidthFlexible && 'auto') || rectangle.width
        };
      }
    })() as React.CSSProperties;
    return (
      <div
          key={index}
          style={{
            ...FlexLayoutViewer.STYLE.basicRectangle,
            backgroundColor,
            width: rectangle.width,
            height: rectangle.height,
            ...orientationStyle,
          }}>
        <div style={FlexLayoutViewer.STYLE.borderContainer}
            className={extraStyle}>
          {rectangle.name}
        </div>
      </div>);
  }

  private onChangeWidthCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({isWidthEnabled: event.target.checked});
  }

  private onChangeWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({width: event.target.valueAsNumber});
  }

  private onChangeHeightCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({isHeightEnabled: event.target.checked});
  }

  private onChangeHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({height: event.target.valueAsNumber});
  }

  private static readonly CONSTRAINT_COLORS = {
    [Constraint.FIXED]: '#FFBB00',
    [Constraint.FILL_SPACE]: '#0066FF',
    [Constraint.FIT_CONTENT]: '#00BF2D',
  };
  private static readonly STYLE = {
    wrapper: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    } as React.CSSProperties,
    container: {
      height: 'calc(100% - 30px)',
      display: 'flex',
      alignContent: 'flex-start'
    } as React.CSSProperties,
    basicRectangle: {
      position: 'relative',
      top: 0,
      left: 0,
      overflow: 'hidden',
      border: 'none'
    } as React.CSSProperties,
    borderContainer: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'grid',
      placeItems: 'center'
    } as React.CSSProperties,
    inputContainer: {
      height: 30,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: 30,
      marginTop: 'auto'
    } as React.CSSProperties,
    inputGroup: {
      display: 'flex',
      alignItems: 'center'
    } as React.CSSProperties
  };
}
