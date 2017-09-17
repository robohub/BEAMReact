import { gql } from 'react-apollo';

export const allBOQuery = gql`
query allBusinessObjects {
  allBusinessObjects {
    id
    name
    state
    metaObject {
      id
      name
    }
    bizAttributes {
      id
      metaAttribute
      {
        id
        name
      }
      value
    }
  
    outgoingRelations {
      id
      oppositeObject {
        id
        name
      }
      metaRelation {
        id
        multiplicity
        oppositeName
      }
    }
  }
}
`;