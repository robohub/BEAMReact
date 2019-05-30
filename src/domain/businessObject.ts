import gql from 'graphql-tag';

import { client } from '../index';

import { RelatedBOType, RelatedBAType } from './utils/boUtils';
import { removePlansFromCache, removeBusinessObjectsFromCache, removePlanConfigsFromCache } from '../utils/apolloExtensions';
import {  FetchResult } from 'react-apollo';
import { PureQueryOptions } from 'apollo-client';

export const upsertBO = gql`
mutation upsertBO(
  $boId: ID, 
  $boName: String!, 
  $metaObjectId: ID, 
  $metaAttributes: [RelatedBAInput!],
  $newRels: [RelatedBOInput!],
  $deleteRels: [RelatedBOInput!]
) {
    saveUpdateBusinessObject (
      data: {
        boId: $boId,
        name: $boName,
        moId: $metaObjectId,
        attributes: $metaAttributes,
        newRelations: $newRels,
        deleteRelations: $deleteRels
      }
    ) {
        id
        name
        state
    } 
}
`;

const updatePlan = gql`
mutation updatePlan($planId: ID!, $planData: Json, $boId: ID, $itemBOs: [BusinessObjectWhereUniqueInput!]) {
    upsertPlan(
    where: {
        id: $planId
    }
    create: {
		planData: $planData, planBO: {connect: {id: $boId}}, itemBOs: {connect: $itemBOs}
    }
    update: {
		planData: $planData, planBO: {connect: {id: $boId}}
    }
    ) {
        id
    }
}
`;

export const updateSaveBO =  async (
    bizObjectId: string,            // If === '' --> create, otherwise update
    boName: string,                 // Create only for now RH TODO
    metaObjectId: string,           // Create
    newAttrs: RelatedBAType[],      // Create and update
    newRels: RelatedBOType[],       // Create and update
    delRels: RelatedBOType[],       // Update
    saveFinished: () => void,
    refetchQueries: PureQueryOptions[]
    ) => {
       
    // tslint:disable-next-line:no-console
    console.log('A. Enters updateSaveBO,.....');
       
    await client.mutate({     // RH TODO, check when this should be executed!!!
        mutation: upsertBO,

        variables: {
            boId: bizObjectId,
            boName: boName,
            metaObjectId: metaObjectId,
            metaAttributes: newAttrs,
            newRels: newRels,
            deleteRels: delRels,
        },
        update: async (cache, mutationResult ) => {
            removeBusinessObjectsFromCache(cache);
            removePlansFromCache(cache);   // Will initiate that queries starting with "plan" will be reading from db, see Planner
            if (refetchQueries.length) {   // RH TODO Just a test!!! Don't invalidate when coming from updateBORelations() --> planConfig query = {}
                removePlanConfigsFromCache(cache);
            }

            // tslint:disable-next-line:no-console
            console.log('BA. Saved BO, clearing cache.....');
        },
        refetchQueries: refetchQueries,   // --> synkproblem i GUI, null-pointers...? Uppdaterad apollo + react-apollo -> verkar fixat...
    });
/*
    if (refetchQueries) {
        // tslint:disable-next-line:no-any
        let refetchPromises = new Array<Promise<any>>();
        refetchQueries.map(async (q: PureQueryOptions) => {
            if (q.variables) {
                refetchPromises.push(client.query({
                // await client.query({
                    query: q.query,
                    variables: q.variables,
                    fetchPolicy: 'network-only'
                }));
                // tslint:disable-next-line:no-console
                console.log('+++++++ Refetch query: with variables');

            } else {
                refetchPromises.push(client.query({
                // await client.query({
                    query: q.query,
                    fetchPolicy: 'network-only'
                }));
                // tslint:disable-next-line:no-console
                console.log('+++++++ Refetch query');
            }
        });
        await Promise.all(refetchPromises);
    }
*/
    // tslint:disable-next-line:no-console
    console.log('C. Exits updateSaveBO,.....');

    saveFinished();

};

export async function updateBORelations(
    boId: string,
    boName: string,
    moId: string,
    addedObjs: RelatedBOType[],
    deletedObjs: RelatedBOType[],
    saveFinished: () => void,
    refetchQueries: PureQueryOptions[],
    planId?: string,
    planData?: { items: {}[], groups: {}[] },
    planObjs?: RelatedBOType[]
) {

    // Check if planId != null, update plandata if so... 
    if (planId !== undefined && planId !== null) {

        await updateSaveBO(boId, boName, moId, [], addedObjs, deletedObjs, saveFinished, []);

        var planBOs = new Array<{id: string}>();  // Filter out Id
        
        planObjs.map(item => {
            planBOs.push({id: item.boId});
        });

        let result = await client.mutate({
            mutation: updatePlan,
            variables: { 
                planId: planId,
                planData: planData,
                boId: boId,
                itemBOs: planBOs   // Only used when creating a plan in upsert...updateSaveBO takes of updates
            },
            // update: // Update cache....
            refetchQueries: refetchQueries
        }) as FetchResult<{upsertPlan: { id: string}}>;

        return result.data.upsertPlan.id;

    } else {
        await updateSaveBO(boId, boName, moId, [], addedObjs, deletedObjs, saveFinished, refetchQueries);
        return '';
    }
}
