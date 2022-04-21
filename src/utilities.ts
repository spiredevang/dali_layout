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

export const BORDER_STYLES = (() => {
  const borderStylesObject = {} as {[key: string]: any};
  const borderPairs = [
    [Constraint.FIXED, Constraint.FILL_SPACE],
    [Constraint.FILL_SPACE, Constraint.FIXED],
    [Constraint.FIXED, Constraint.FIT_CONTENT],
    [Constraint.FIT_CONTENT, Constraint.FIXED],
    [Constraint.FILL_SPACE, Constraint.FIT_CONTENT],
    [Constraint.FIT_CONTENT, Constraint.FILL_SPACE]
  ];
  borderPairs.forEach(borderPair => {
    const mainConstraint = (borderPair[0] === Constraint.FIXED) ||
      (borderPair[1] === Constraint.FIXED) ? Constraint.FIXED :
      Constraint.FILL_SPACE;
    const mainColor = CONSTRAINT_COLORS[mainConstraint];
    const [secondColor, borderA, borderB, positionA, positionB, measurement] =
      (() => {
        if(borderPair[0] === mainConstraint) {
          return [CONSTRAINT_COLORS[borderPair[1]], 'borderTop',
            'borderBottom', 'top', 'bottom', 'width'];
        } else {
          return [CONSTRAINT_COLORS[borderPair[0]], 'borderLeft',
            'borderRight', 'left', 'right', 'height'];
        }
      })();
    borderStylesObject[`H${borderPair[0]}V${borderPair[1]}`] = StyleSheet.
      create({
        border: {
          border: `8px solid ${mainColor}`,
          '::before': {
            display: 'block',
            content: '""',
            [borderA]: `8px solid ${secondColor}`,
            position: 'absolute',
            [positionA]: -8,
            [measurement]: '100%'
          },
          '::after': {
            display: 'block',
            content: '""',
            [borderB]: `8px solid ${secondColor}`,
            position: 'absolute',
            [positionB]: -8,
            [measurement]: '100%'
          }
        }
      });
  });
  return borderStylesObject;
})();

export function getRectangleBorderStyles(rectangle: Rectangle) {
  if(rectangle.horizontal === rectangle.vertical) {
    return '';
  }
  return css(BORDER_STYLES[
    `H${rectangle.horizontal}V${rectangle.vertical}`].border);
}
