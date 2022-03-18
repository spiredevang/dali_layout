import {css, StyleSheet} from 'aphrodite';
import * as React from 'react';
import {Constraint, Rectangle} from '../rectangle';

interface Properties {
  rectangles: Rectangle[];
}

/** The layout viewer component. */
export class LayoutViewer extends React.Component<Properties> {
  public render(): JSX.Element {
    return (
      <div style={LayoutViewer.STYLE.container}>
        {this.props.rectangles.map(this.renderRectangle)}
      </div>);
  }

  private renderRectangle(rectangle: Rectangle, index: number) {
    const isConstraintUniform = rectangle.horizontalPolicy ===
      rectangle.verticalPolicy;
    const backgroundColor = isConstraintUniform &&
      LayoutViewer.CONSTRAINT_COLORS[rectangle.horizontalPolicy] || '#F5F5F5';
    const extraStyle = (() => {
      if(isConstraintUniform) {
        return '';
      }
      const mainConstraint = (rectangle.horizontalPolicy === Constraint.FIXED
        || rectangle.verticalPolicy === Constraint.FIXED) ? Constraint.FIXED :
        Constraint.FILL_SPACE;
      const mainColor = LayoutViewer.CONSTRAINT_COLORS[mainConstraint];
      if(rectangle.horizontalPolicy === mainConstraint) {
        const secondColor = LayoutViewer.CONSTRAINT_COLORS[
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
        const secondColor = LayoutViewer.CONSTRAINT_COLORS[
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
    return (
      <div key={index}
          style={{
            ...LayoutViewer.STYLE.basicRectangle,
            backgroundColor,
            top: rectangle.top,
            left: rectangle.left,
            width: rectangle.width,
            height: rectangle.height}}
          className={extraStyle}>
        {rectangle.name}
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
      minHeight: 500
    } as React.CSSProperties,
    basicRectangle: {
      position: 'absolute',
      display: 'grid',
      placeItems: 'center'
    } as React.CSSProperties
  };
}
