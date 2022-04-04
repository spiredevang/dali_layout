import {css, StyleSheet} from 'aphrodite';
import * as React from 'react';
import {Constraint, Rectangle} from '../rectangle';
import {Orientation} from './home_page';

interface Properties {
  rectangleMatrix: Rectangle[][];
  orientation: Orientation;
}

/** The flex layout viewer component. */
export class FlexLayoutViewer extends React.Component<Properties> {
  public render(): JSX.Element {
    const isRow = this.props.orientation === Orientation.ROW;
    const flexContainerDirection = isRow && 'column' || 'row';
    const flexDirection = isRow && 'row' || 'column';
    const gap = isRow && '1px 0' || '0 1px';
    const dim = isRow && {width: '100%', columnGap: 1} || {height: '100%', rowGap: 1};
    return (
      <div style={{...FlexLayoutViewer.STYLE.flexContainer,
          flexDirection: flexContainerDirection, gap}}>
        {this.props.rectangleMatrix?.map((set, index) => {
          const isWidthFlexible = set.every(rect =>
            rect.horizontalPolicy === Constraint.FILL_SPACE);
          const isHeightFlexible = set.every(rect =>
            rect.verticalPolicy === Constraint.FILL_SPACE);
          const flex = (() => {
            if(isRow) {
              return isHeightFlexible && '1 1 auto' || '0 0 auto';
            } else {
              return isWidthFlexible && '1 1 auto' || '0 0 auto';
            }
          })();
          return (
            <div style={{display: 'flex', flexDirection, flex, ...dim}} key={index}>
              {set.map(this.renderRectangle)}
            </div>);
        })}
    </div>);
  }

  private renderRectangle = (rectangle: Rectangle, index: number) => {
    const isConstraintUniform = rectangle.horizontalPolicy ===
      rectangle.verticalPolicy;
    const backgroundColor = (isConstraintUniform &&
      FlexLayoutViewer.CONSTRAINT_COLORS[rectangle.horizontalPolicy]) || '#F5F5F5';
    const extraStyle = (() => {
      if(isConstraintUniform) {
        return '';
      }
      const mainConstraint = (rectangle.horizontalPolicy === Constraint.FIXED)
        || (rectangle.verticalPolicy === Constraint.FIXED) ? Constraint.FIXED :
        Constraint.FILL_SPACE;
      const mainColor = FlexLayoutViewer.CONSTRAINT_COLORS[mainConstraint];
      if(rectangle.horizontalPolicy === mainConstraint) {
        const secondColor = FlexLayoutViewer.CONSTRAINT_COLORS[
          rectangle.verticalPolicy];
        const extraStyles = StyleSheet.create({
          rectangle: {
            border: `8px solid ${mainColor}`,
            '::before': {
              display: 'block',
              content: '""',
              borderTop: `8px solid ${secondColor}`,
              position: 'absolute',
              top: -8,
              width: '100%'
            },
            '::after': {
              display: 'block',
              content: '""',
              borderBottom: `8px solid ${secondColor}`,
              position: 'absolute',
              bottom: -8,
              width: '100%'
            }
          }
        })
        return css(extraStyles.rectangle);
      } else {
        const secondColor = FlexLayoutViewer.CONSTRAINT_COLORS[
          rectangle.horizontalPolicy];
        const extraStyles = StyleSheet.create({
          rectangle: {
            border: `8px solid ${mainColor}`,
            '::before': {
              display: 'block',
              content: '""',
              borderLeft: `8px solid ${secondColor}`,
              position: 'absolute',
              left: -8,
              height: '100%'
            },
            '::after': {
              display: 'block',
              content: '""',
              borderRight: `8px solid ${secondColor}`,
              position: 'absolute',
              right: -8,
              height: '100%'
            }
          }
        });
        return css(extraStyles.rectangle);
      }
    })();
    const isWidthFlexible = rectangle.horizontalPolicy === Constraint.FILL_SPACE;
    const isHeightFlexible = rectangle.verticalPolicy === Constraint.FILL_SPACE;
    const orientationStyle = (() => {
      if(this.props.orientation === Orientation.ROW) {
        return {
          flex: isWidthFlexible && '1 1 auto' || '0 0 auto',
          height: isHeightFlexible && 'auto' || rectangle.height
        };
      } else if(this.props.orientation === Orientation.COLUMN) {
        return {
          flex: isHeightFlexible && '1 1 auto' || '0 0 auto',
          width: isWidthFlexible && 'auto' || rectangle.width
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

  private static readonly CONSTRAINT_COLORS = {
    [Constraint.FIXED]: '#FFBB00',
    [Constraint.FILL_SPACE]: '#0066FF',
    [Constraint.FIT_CONTENT]: '#00BF2D',
  };
  private static readonly STYLE = {
    container: {
      position: 'relative',
      overflow: 'auto',
      border: '5px solid #000000',
      height: '100%'
    } as React.CSSProperties,
    flexContainer: {
      height: '100%',
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
    } as React.CSSProperties
  };
}
