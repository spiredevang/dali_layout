import * as React from 'react';
import ReactDOM from 'react-dom';

interface Properties {
  width?: number;
  height?: number;
  onClosePopup: () => void;
}

interface State {
  el: any;
  win: Window;
}

/** The popup component. */
export class Popup extends React.Component<Properties, State> {
  public static readonly defaultProps: {
    width: 1000,
    height: 500;
  }

  constructor(props: Properties) {
    super(props);
    this.state = {el: null, win: window};
  }

  public render(): JSX.Element {
    if(!this.state.el) {
      return <></>;
    } 
    return ReactDOM.createPortal(this.props.children, this.state.el);  
  }

  public componentDidMount(): void {
    const {width, height} = this.props;
    const win = this.state.win.open('', '', `width=${width},height=${height}`) as Window;
    const el = document.createElement('div');
    win.document.body.appendChild(el);
    this.setState({el, win});
    win.addEventListener('beforeunload', this.props.onClosePopup);
    copyStyles(document, win.document);
    el.setAttribute('style', 'height: 100%;');
  }

  public componentWillUnmount(): void {
    this.state.win.close();
  }
}

function copyStyles(sourceDoc: Document, targetDoc: Document) {
  Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
    if(styleSheet.cssRules) {
      const newStyleEl = targetDoc.createElement('style');
      Array.from(styleSheet.cssRules).forEach(cssRule => {
        newStyleEl.appendChild(targetDoc.createTextNode(cssRule.cssText));
      });
      targetDoc.head.appendChild(newStyleEl);
    } else if(styleSheet.href) {
      const newLinkEl = targetDoc.createElement('link');
      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
}
