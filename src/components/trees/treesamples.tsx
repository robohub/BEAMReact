import * as React from 'react';

import { Card, CardBlock, CardTitle, CardSubtitle, Col } from 'reactstrap';

export default function TreeComp() {
  return (
    <div>
      <Col sm="9">
        <Card block={true} outline={true} color="warning">
          <CardBlock>
            <CardTitle>This is a react tree component</CardTitle>
            <CardSubtitle>draggable-react-tree-component</CardSubtitle>
          </CardBlock>
        </Card>
        <Card block={true} inverse={true} color="primary">
            <CardBlock>
                <CardTitle>D3</CardTitle>
                This will showcase a D3 tree!
            </CardBlock>
        </Card>
        <Card block={true} outline={true} color="success">
            <CardBlock>
                <CardTitle>Intressant sidebar för React</CardTitle>
                react-sidebar
            </CardBlock>
        </Card>
      </Col>

    </div>
  );
}