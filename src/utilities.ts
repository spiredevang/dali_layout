import {Constraint} from './rectangle';

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
