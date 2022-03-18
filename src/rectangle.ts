export interface Rectangle {
  name: string;
  width: number;
  height: number;
  left: number;
  top: number;
  horizontalPolicy: Constraint;
  verticalPolicy: Constraint;
}

export enum Constraint {
  FIXED,
  FILL_SPACE,
  FIT_CONTENT
}
