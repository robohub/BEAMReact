import * as React from 'react';
import { MORelationItemType, /*MOPropType*/ } from './Types';
import { Avatar, Chip, FontIcon } from 'react-md';

export default function MOAttributeItem({ oppositeName, oppositeObject, multiplicity }: MORelationItemType) {

    return (
        <Chip
            label={oppositeName + ': (' + oppositeObject.name + ', ' + multiplicity + ')'}
            avatar={<Avatar><FontIcon>link</FontIcon></Avatar>}
        />
    );
}