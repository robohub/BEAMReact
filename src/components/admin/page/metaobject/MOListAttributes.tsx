import * as React from 'react';
import { MOPropertiesType } from './Types';
import MOAttributeItem from './MOAttributeItem';

import { Segment, List, /* Divider, /*Rail, Icon,*/ } from 'semantic-ui-react';

export default function MOListAttributes({ name, attributes }: MOPropertiesType) {

    return (
        <Segment.Group >
            <Segment>
                <List selection={false} divided={true} relaxed={true}>
                    {attributes.map(p =>
                        <List.Item key={p.name}>
                            <MOAttributeItem name={p.name} type={p.type}/>
                        </List.Item>
                    )}
                </List>
            </Segment>
        </Segment.Group>
    );
}
