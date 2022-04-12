export interface Rectangle {
  name: string;
  width: number;
  height: number;
  left: number;
  top: number;
  horizontal: Constraint;
  vertical: Constraint;
}

export enum Constraint {
  FIXED,
  FILL_SPACE,
  FIT_CONTENT
}
