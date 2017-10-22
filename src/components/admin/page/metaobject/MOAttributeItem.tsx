import * as React from 'react';
import { MOAttributeItemType, /*MOPropType*/ } from './Types';
import { Avatar, Chip, FontIcon } from 'react-md';

export default function MOAttributeItem({ name, type }: MOAttributeItemType) {

    // let icon = (type === MOPropType.ATTRIBUTE) ? 'attach' : 'linkify';
    return (
        <Chip
            label={name + ': ' + type}
            avatar={<Avatar><FontIcon>attachment</FontIcon></Avatar>}
        />
  );
}
