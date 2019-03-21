import * as React from 'react';
import { MOAttributeItemType, /*MOPropType*/ } from './Types';
import AttachementIcon from '@material-ui/icons/AttachFile';
import { Chip, Avatar } from '@material-ui/core';

export default function MOAttributeItem({ name, type }: MOAttributeItemType) {

    // let icon = (type === MOPropType.ATTRIBUTE) ? 'attach' : 'linkify';
    return (
        <Chip
            label={name + ': ' + type}
            avatar={<Avatar><AttachementIcon/></Avatar>}
        />
  );
}
