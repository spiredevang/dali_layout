const NUMBER_REGEX = /^\d+/;
export const PROPERTY_REGEX = /^[a-z0-9]+\.(w(idth)?|h(eight)?)/i;
export const MEASUREMENT_REGEX = /^(w(idth)?|h(eight)?)/i;
export const WIDTH_REGEX = /^(w(idth)?)/i;
export const HEIGHT_REGEX = /^(h(eight)?)/i;
const OPERATORS = '-+/*^';
const PRECEDENCE = {
  '^': 4,
  '*': 3,
  '/': 3,
  '+': 2,
  '-': 2
} as {[key: string]: number};
const ASSOCIATIVITY = {
  '^': 'Right',
  '*': 'Left',
  '/': 'Left',
  '+': 'Left',
  '-': 'Left'
} as {[key: string]: string};

export class EqualityConstraint {
  public constructor(constraint: string) {
    const trimmedConstraint = constraint.replace(/\s+/g, '');
    const [property, infixNotation] = trimmedConstraint.split('=');
    this.text = trimmedConstraint;
    this.property = property;
    this.postfixNotation = getPostfixfromInfix(infixNotation);
    console.log(
      'input: ', this.text,
      '| postfix notation: ',this.postfixNotation,
      '| affected properties: ', this.AffectedProperties);
  }

  public get Property(): string {
    return this.property;
  }

  public get Text(): string {
    return this.text;
  }

  public get PostfixNotation(): (string|number)[] {
    return this.postfixNotation.slice();
  }

  public get AffectedProperties():
      {name: string, attribute: string, index: number}[] {
    const [name, attribute] = this.property.split('.');
    const properties = [{name, attribute, index: 0}];
    this.postfixNotation.forEach((token, index) => {
      if((typeof token === 'string') && token.length > 1) {
        const property = token.split('.');
        properties.push({
          name: property[0],
          attribute: property[1],
          index
        });
      }
    });
    return properties;
  }

  public evaluate(): number {
    return EvaluatePostFix(this.postfixNotation);
  }

  private text: string;
  private property: string;
  private postfixNotation: (string|number)[];
}

class Stack {
  public constructor() {
    this.dataStore = [];
    this.top = 0;
  }

  public push(element: number | string) {
    this.dataStore[this.top++] = element;
  }
   
  public pop() {
    return this.dataStore[--this.top];
  }
   
  public peek() {
    return this.dataStore[this.top - 1];
  }
   
  public length() {
    return this.top;
  }

  public get DataStore() {
    return this.dataStore;
  }

  private dataStore: any;
  private top: number;
}

function getPostfixfromInfix(infix: string) {
  let token;
  let postfix = [];
  const operatorStack = new Stack();
  let operatorOne = '';
  let operatorTwo = '';
  let counter = infix.length;
  while(infix.length) {
    token = infix[0];
    if(NUMBER_REGEX.test(infix)) {
      const numText = NUMBER_REGEX.exec(infix);
      infix = infix.replace(`${numText}`, '');
      if(numText !== null) {
        postfix.push(+numText[0]);
      }
    } else if(PROPERTY_REGEX.test(infix)){
      const propertyLong = PROPERTY_REGEX.exec(infix);
      if(propertyLong !== null) {
        infix = infix.replace(`${propertyLong[0]}`, '');
        postfix.push(propertyLong[0]);
      }
    } else if(MEASUREMENT_REGEX.test(infix)){
      const containerLong = MEASUREMENT_REGEX.exec(infix);
      if(containerLong !== null) {
        infix = infix.replace(`${containerLong[0]}`, '');
        postfix.push(containerLong[0]);
      }
    } else if(OPERATORS.indexOf(token) !== -1) {
      infix = infix.slice(1);
      operatorOne = token;
      operatorTwo = operatorStack.peek();
      while(OPERATORS.indexOf(operatorTwo) !== -1 && (
          (ASSOCIATIVITY[operatorOne] === 'Left' &&
            (PRECEDENCE[operatorOne] <= PRECEDENCE[operatorTwo])) || 
          (ASSOCIATIVITY[operatorOne] === 'Right' &&
            (PRECEDENCE[operatorOne] < PRECEDENCE[operatorTwo])))) {
        postfix.push(operatorTwo);
        operatorStack.pop();
        operatorTwo = operatorStack.peek();
      }
      operatorStack.push(operatorOne);
    } else if(token === '(') {
      infix = infix.slice(1);
      operatorStack.push(token);
    } else if(token === ')') {
      infix = infix.slice(1);
      while(operatorStack.peek() !== '(') {
        postfix.push(operatorStack.pop());
      }
      operatorStack.pop();
    }
    --counter;
    if(counter < 0) {
      break;
    }
  }
  postfix.push(...operatorStack.DataStore.reverse());
  return postfix;
}

export function EvaluatePostFix(postFix: (number|string)[]) {
  const numbers = [];
  const postFixCopy = postFix.slice();
  while(postFixCopy.length) {
    const content = postFixCopy.shift();
    if(typeof content === 'number') {
      numbers.push(content);
    } else {
      switch(content) {
        case '-':
          const subtrahend = numbers.pop() as number;
          const minuend = numbers.pop() as number;
          numbers.push(minuend - subtrahend);
          break;
        case '+':
          const termB = numbers.pop() as number;
          const termA = numbers.pop() as number;
          numbers.push(termA + termB);
          break;
        case '/':
          const divisor = numbers.pop() as number;
          const dividend = numbers.pop() as number;
          numbers.push(dividend / divisor);
          break;
        case '*':
          const multiplicand = numbers.pop() as number;
          const multiplier = numbers.pop() as number;
          numbers.push(multiplier * multiplicand);
          break;
        case '^':
          const exponent = numbers.pop() as number;
          const base = numbers.pop() as number;
          numbers.push(base ** exponent);
          break;
      }
    }
  }
  return numbers[0];
}
