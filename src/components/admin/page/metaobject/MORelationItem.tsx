import * as React from 'react';
import { MORelationItemType, /*MOPropType*/ } from './Types';
import { Icon, Label } from 'semantic-ui-react';

export default function MOAttributeItem({ oppositeName, oppositeObject, multiplicity }: MORelationItemType) {

  // let icon = (type === MOPropType.ATTRIBUTE) ? 'attach' : 'linkify';
  let icon = 'linkify';
  return (
    <div>
      <Icon name={icon}/>
      {oppositeName} {' '}
      <Label size="small">
        {oppositeObject.name}
      </Label>
      <Label size="small">
        {multiplicity}
      </Label>
    </div>
  );
}