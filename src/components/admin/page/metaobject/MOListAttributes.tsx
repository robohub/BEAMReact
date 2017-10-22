import * as React from 'react';
import { MOPropertiesType } from './Types';
import MOAttributeItem from './MOAttributeItem';

// import { List, ListItem } from 'react-md';

export default function MOListAttributes({ name, attributes }: MOPropertiesType) {

    return (
        <div>
            {attributes.length === 0 ?
                'No attributes"/>'
                :
                attributes.map(p =>
                    /* <ListItem primaryText="TESTAR" key={p.name}> */
                        <MOAttributeItem name={p.name} type={p.type} key={p.id}/>
                    /* </ListItem> */
            )}
        </div>
    );
}
