import * as React from 'react';

interface Properties {}

interface State {}

/** The home page component. */
export class HomePage extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props)
    this.state = {};
  }

  public render(): JSX.Element {
    return (
      <div style={HomePage.STYLE.container}>
        <h1>Layout Application</h1>
      </div>);
  }

  private static readonly STYLE = {
    container: {
      width: 'clamp(767px, 100%, 1280px)',
      padding: '0 15px',
      display: 'flex',
      flexDirection: 'column'
    } as React.CSSProperties
  };
}
