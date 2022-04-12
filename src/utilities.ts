import {css, StyleSheet} from 'aphrodite';
import {Constraint, Rectangle} from './rectangle';

export function getConstraint(text: string): Constraint | null {
  switch(text.toUpperCase()) {
    case 'FIXED':
      return Constraint.FIXED;
    case 'FILL_SPACE':
      return Constraint.FILL_SPACE;
    case 'FIT_CONTENT':
      return Constraint.FIT_CONTENT;
    default:
      return null;
  }
}

const CONSTRAINT_COLORS = {
  [Constraint.FIXED]: '#FFBB00',
  [Constraint.FILL_SPACE]: '#0066FF',
  [Constraint.FIT_CONTENT]: '#00BF2D',
};

export function getRectangleBorderStyles(rectangle: Rectangle) {
  const isConstraintUniform = rectangle.horizontal ===
    rectangle.vertical;
  if(isConstraintUniform) {
    return '';
  }
  const mainConstraint = (rectangle.horizontal === Constraint.FIXED)
    || (rectangle.vertical === Constraint.FIXED) ? Constraint.FIXED :
    Constraint.FILL_SPACE;
  const mainColor = CONSTRAINT_COLORS[mainConstraint];
  if(rectangle.horizontal === mainConstraint) {
    const secondColor = CONSTRAINT_COLORS[
      rectangle.vertical];
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
    const secondColor = CONSTRAINT_COLORS[
      rectangle.horizontal];
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
}
