export interface Rectangle {
  name: string;
  width: number;
  height: number;
  position: [number, number];
  horizontalPolicy: Constraint;
  verticalPolicy: Constraint;
}

export enum Constraint {
  FIXED,
  FILL_SPACE
}
