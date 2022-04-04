import * as React from 'react';
import ReactDOM from 'react-dom';

interface Properties {
  onClosePopup: () => void;
}

interface State {
  el: any;
  win: Window;
}

/** The popup component. */
export class Popup extends React.Component<Properties, State> {
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
    const win = this.state.win.open('', '', 'width=1000,height=500') as Window;
    const el = document.createElement('div');
    win.document.body.appendChild(el);
    this.setState({el, win});
    win.addEventListener('beforeunload', this.props.onClosePopup);
    copyStyles(document, win.document);
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