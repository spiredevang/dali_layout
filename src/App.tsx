import {HomePage} from './components';

function App() {
  return (
    <div style={STYLE.container}>
      <HomePage/>
    </div>
  );
}

const STYLE = {
  container: {
    display: 'flex',
    justifyContent: 'center'
  } as React.CSSProperties
}

export default App;
