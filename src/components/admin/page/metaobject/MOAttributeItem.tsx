import * as React from 'react';
import { MOAttributeItemType, /*MOPropType*/ } from './Types';
import { Icon, Label } from 'semantic-ui-react';

export default function MOAttributeItem({ name, type }: MOAttributeItemType) {

  // let icon = (type === MOPropType.ATTRIBUTE) ? 'attach' : 'linkify';
  let icon = 'attach';
  return (
    <div>
      <Icon name={icon}/>
      {name} {' '}
      <Label size="small">
        {type}
      </Label>
    </div>
  );
}