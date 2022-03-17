export interface Rectangle {
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  horizontalPolicy: Constraint;
  verticalPolicy: Constraint;
}

export enum Constraint {
  FIXED,
  FILL_SPACE,
  FIT_CONTENT
}
