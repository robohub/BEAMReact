import * as React from 'react';
import { MOPropertiesType } from './Types';
import MORelationItem from './MORelationItem';

import { Segment, List } from 'semantic-ui-react';

export default function MOListAttributes({ name, outgoingRelations }: MOPropertiesType) {

    return (
        <Segment>
            <List selection={false} divided={true} relaxed={true}>
                {outgoingRelations.map((p, index) =>
                    <List.Item key={index}>
                        <MORelationItem oppositeName={p.oppositeName} oppositeObject={p.oppositeObject} multiplicity={p.multiplicity} />
                    </List.Item>
                )}
            </List>
        </Segment>
    );
}
