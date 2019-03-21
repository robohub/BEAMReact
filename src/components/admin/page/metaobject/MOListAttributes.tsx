import * as React from 'react';
import { MOPropertiesType } from './Types';
import MOAttributeItem from './MOAttributeItem';

export default function MOListAttributes({ attributes }: MOPropertiesType) {

    return (
        <div>
            {attributes.length === 0 ?
                'No attributes defined.'
                :
                attributes.map(p =>
                        <MOAttributeItem name={p.name} type={p.type} key={p.id}/>
            )}
        </div>
    );
}
