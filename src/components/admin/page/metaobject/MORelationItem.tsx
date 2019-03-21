import * as React from 'react';
import { MORelationItemType, /*MOPropType*/ } from './Types';
import LinkIcon from '@material-ui/icons/Link';
import { Chip, Avatar } from '@material-ui/core';

export default function MORelationItem({ oppositeName, oppositeObject, multiplicity }: MORelationItemType) {

    return (
        <Chip 
            // tslint:disable-next-line:max-line-length
            label={oppositeName + ': (' + oppositeObject.name + ', ' + multiplicity + ')'}
            avatar={<Avatar><LinkIcon/></Avatar>}
        />

    );
}