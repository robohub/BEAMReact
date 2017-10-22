import * as React from 'react';
import { MOPropertiesType } from './Types';
import MORelationItem from './MORelationItem';

export default function MOListAttributes({ name, outgoingRelations }: MOPropertiesType) {

    return (
        <div>
            {outgoingRelations.length === 0 ?
                'No relations"/>'
                :
                outgoingRelations.map(p  =>
                    <MORelationItem key={p.id} oppositeName={p.oppositeName} oppositeObject={p.oppositeObject} multiplicity={p.multiplicity} />
                )
            }
        </div>
    );
}
