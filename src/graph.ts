import {Rectangle} from './rectangle';

interface HorizontalEdge {
  node: LayoutNode;
  left: number;
  right: number;
  top: number;
}

interface VerticalEdge {
  node: LayoutNode;
  top: number;
  bottom: number;
  left: number;
}

abstract class Graph {};

abstract class Node {
  public abstract get Rectangle(): Rectangle;
  public abstract addTopEdge(edge: HorizontalEdge): void;
  public abstract addRightEdge(edge: VerticalEdge): void;
  public abstract addBottomEdge(edge: HorizontalEdge): void;
  public abstract addLeftEdge(edge: VerticalEdge): void;
  public abstract get TopEdges(): HorizontalEdge[];
  public abstract get RightEdges(): VerticalEdge[];
  public abstract get BottomEdges(): HorizontalEdge[];
  public abstract get LeftEdges(): VerticalEdge[];
}

export class LayoutNode extends Node {

  public constructor(rectangle: Rectangle) {
    super();
    this.rectangle = rectangle;
    this.topEdges = [];
    this.rightEdges = [];
    this.bottomEdges = [];
    this.leftEdges = [];
  }

  public get Rectangle(): Rectangle {
    return this.rectangle;
  }

  public addTopEdge(edge: HorizontalEdge) {
    this.topEdges.push(edge);
  }

  public addRightEdge(edge: VerticalEdge) {
    this.rightEdges.push(edge);
  }

  public addBottomEdge(edge: HorizontalEdge) {
    this.bottomEdges.push(edge);
  }

  public addLeftEdge(edge: VerticalEdge) {
    this.leftEdges.push(edge);
  }

  public get TopEdges(): HorizontalEdge[] {
    return this.topEdges;
  }

  public get RightEdges(): VerticalEdge[] {
    return this.rightEdges;
  }

  public get BottomEdges(): HorizontalEdge[] {
    return this.bottomEdges;
  }

  public get LeftEdges(): VerticalEdge[] {
    return this.leftEdges;
  }

  private rectangle: Rectangle;
  private topEdges: HorizontalEdge[];
  private rightEdges: VerticalEdge[];
  private bottomEdges: HorizontalEdge[];
  private leftEdges: VerticalEdge[];
}


export class LayoutGraph extends Graph {
  public constructor(rectangles: Rectangle[]) {
    super();
    this.nodes = rectangles.map(rectangle => new LayoutNode(rectangle));
    this.nodes.forEach((node, nodeIndex) => {
      const nodeLeft = node.Rectangle.left;
      const nodeRight = node.Rectangle.left + node.Rectangle.width;
      const nodeTop = node.Rectangle.top;
      const nodeBottom = node.Rectangle.top + node.Rectangle.height;
      this.nodes.forEach((surr, surroundingIndex) => {
        if(surroundingIndex !== nodeIndex) {
          const surrLeft = surr.Rectangle.left;
          const surrRight = surr.Rectangle.left + surr.Rectangle.width;
          const surrTop = surr.Rectangle.top;
          const surrBottom = surr.Rectangle.top + surr.Rectangle.height;
          if(nodeTop === surrBottom &&
              ((nodeLeft <= surrLeft && surrLeft < nodeRight) ||
              (nodeLeft < surrRight && surrRight <= nodeRight))) {
            const horizontalEdge = {
              node: surr,
              top: nodeTop,
              left: Math.max(nodeLeft, surrLeft),
              right: Math.min(nodeRight, surrRight)
            } as HorizontalEdge;
            node.addTopEdge(horizontalEdge);
          } else if(nodeBottom === surrTop &&
              ((nodeLeft <= surrLeft && surrLeft < nodeRight) ||
              (nodeLeft < surrRight && surrRight <= nodeRight))) {
            const horizontalEdge = {
              node: surr,
              top: nodeBottom,
              left: Math.max(nodeLeft, surrLeft),
              right: Math.min(nodeRight, surrRight)
            } as HorizontalEdge;
            node.addBottomEdge(horizontalEdge);
          } else if(nodeLeft === surrRight &&
              ((nodeTop <= surrTop && surrTop < nodeBottom) ||
              (nodeTop < surrBottom && surrBottom <= nodeBottom))) {
            const verticalEdge = {
              node: surr,
              top: Math.max(nodeTop, surrTop),
              bottom: Math.min(nodeBottom, surrBottom),
              left: node.Rectangle.left
            } as VerticalEdge;
            node.addLeftEdge(verticalEdge);
          } else if(nodeRight === surrLeft &&
              ((nodeTop <= surrTop && surrTop < nodeBottom) ||
              (nodeTop < surrBottom && surrBottom <= nodeBottom))) {
            const verticalEdge = {
              node: surr,
              top: Math.max(nodeTop, surrTop),
              bottom: Math.min(nodeBottom, surrBottom),
              left: nodeRight
            } as VerticalEdge;
            node.addRightEdge(verticalEdge);
          }
        }
      });
    });
    this.originNodeIndex = this.nodes.findIndex((node: LayoutNode) =>
      (node.Rectangle.left === 0) && (node.Rectangle.top === 0));
  }

  private nodes: LayoutNode[];
  private originNodeIndex: number; 
}
