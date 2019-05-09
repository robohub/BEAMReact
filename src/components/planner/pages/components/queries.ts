import gql from 'graphql-tag';

export const getPlan = gql`
query getPlan($boid: ID!) {
    plans (where: {planBO: {id: $boid}}) {
        id
        planBO {
            id
            name
        }
        planData
        itemBOs {
            id
            name
        }
    }
}
`;

export const getItemBOs = gql`
query itemBOsFromPlanMO($moid: ID!) {
    planConfigs(
      where: {uiMoPlan: {id: $moid}}
    ) {
        id
        uiMoRelations {
            id
            oppositeName 
          	oppositeObject {
              id
              name
              businessObjects {
                id
                name

              }     
            }

        }
    }
}
`;

export const getConnectedItems = gql`
query connectedItems($boid: ID!) {
    businessObject (where: {id: $boid} ){
      id
      outgoingRelations {
        id
        oppositeObject {
          id
          name
        }
      }
    }
  }
  `;