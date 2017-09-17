import * as React from 'react';
import './Hello.css';

import { Card, CardBlock, CardTitle, CardSubtitle, Col } from 'reactstrap';

export interface Props {
  name: string;
  enthusiasmLevel?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

function Hello({ name, enthusiasmLevel = 1, onIncrement, onDecrement }: Props) {
  if (enthusiasmLevel <= 0) {
    throw new Error('You could be a little more enthusiastic. :D');
  }

  return (
    <div>
      <Col sm="9">
        <Card>
          <CardBlock>
            <CardTitle>Card title</CardTitle>
            <CardSubtitle>Card subtitle</CardSubtitle>
          </CardBlock>
        </Card>
      </Col>
      <div className="hello">
        <div className="greeting">
          Hello {name + getExclamationMarks(enthusiasmLevel)}
        </div>
        <div>
          <button onClick={onDecrement}>-</button>
          <button onClick={onIncrement}>+</button>
        </div>
      </div>
    </div>
  );
}

// helpers

function getExclamationMarks(numChars: number) {
  return Array(numChars + 1).join('!');
}

export default Hello;
