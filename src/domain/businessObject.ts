import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';

import { client } from '../index';

const getBO = gql`
query($id: ID) {
    businessObject(
        where: {id: $id}
    ) {
        id
        outgoingRelations {
            id
            oppositeObject {
                id
            }
        }
    }
}
`;

type getBOResponse = {
    id: string
    outgoingRelations: {
        id: string
        oppositeObject: {
            id: string
        }
    }[]
};
/*
type bizRel = {
    id: string
    oppositeObject: {
        id: string
    }
};

function findDeletedBos(source: bizRel[], compare: {id: string}[]): {id: string}[] {
    var deleted = new Array<{id: string}>(0);
    source.forEach(el => {
        let sourceObj = { id: el.oppositeObject.id }; // Remove field bizRelId from object to compare correctly
        if (compare.findIndex(element => {
            let compObj = { metaRelationId: element.metaRelationId, oppositeObjectId: element.oppositeObjectId }; // Remove field bizRelId from object to compare correctly
            return JSON.stringify(sourceObj) === JSON.stringify(compObj); })
        === -1) {
            deleted.push(el);
        }
    });
    return deleted;
}
*/
export function updateBORelations(id: string, relatedObjs: {id: string}[]): number {
    client.query({
        query: getBO,
        variables: {id: id}
    }).then((response: ApolloQueryResult<getBOResponse>) => {
        //
    }).catch(e => {
        //
    });
    return 5;
}
