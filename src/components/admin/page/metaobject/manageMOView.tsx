import * as React from 'react';
import { gql, graphql } from 'react-apollo';
import MOEdit from './MOEdit';
import { MOEditType } from './Types';

const allMetaObjectsQuery = gql`
query allMetaObjects {
  allMetaObjects {
    id
    name
    attributes {
      name
      type
    }
    outgoingRelations {
      oppositeName
      oppositeObject {
        name
      }
      multiplicity
    }
  }
}
`;

type Response = MOEditType;

const ManageMOView = graphql<Response>(allMetaObjectsQuery, {});

export default ManageMOView(({ data: { loading, allMetaObjects, error } }) => { 
  if (loading) {
    return <div>Loading</div>;
  }
  if (error) {
    return <h1>ERROR</h1>;
  } 
  return (
    <MOEdit allMetaObjects={allMetaObjects}/>
  );
});

/*
  return (
        <MOPropItem name="Robert" type={MOPropType.ATTRIBUTE}/>
  );

  return (
    <MOListItem name="Process" properties={properties}/>
  );
*/

/*
export default function TEST() {
  
  let properties1: MOAttributeItemType[] =
  [
      {name: 'Name', type: 'string'},
      {name: 'Description', type: 'string'},
      {name: 'Owner', type: 'string'},
  ];
  let properties2: MOAttributeItemType[] =
  [
      {name: 'Name', type: 'string'},
      {name: 'Description', type: 'string'},
      {name: 'Address', type: 'string'},
      {name: 'SuperOrg', type: 'string'},
    ];
  let objects: MOListItemType[] =
  [
      {name: 'Process', attributes: properties1},
      {name: 'OrgUnit', attributes: properties2},
      {name: 'Role', attributes: properties1}
  ];

  return (
    <MOListEdit allMetaObjects={objects}/>
  );
}*/