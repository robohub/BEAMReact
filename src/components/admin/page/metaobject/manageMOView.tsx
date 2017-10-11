import * as React from 'react';
import { graphql } from 'react-apollo';
import MOEdit from './MOEdit';
import { MOEditType } from './Types';
import { allMetaObjectsQuery } from './queries';

type Response = MOEditType;

const ManageMOView = graphql<Response>(allMetaObjectsQuery, {});

export default ManageMOView(({ data: { loading, allMetaObjects, allMetaAttributes, error } }) => { 
    if (loading) {
        return <div>Loading</div>;
    }
    if (error) {
        return <h1>ERROR</h1>;
    } 
    return (
        <MOEdit
            allMetaObjects={allMetaObjects}
            allMetaAttributes={allMetaAttributes}
            // allMetaRelations={allMetaRelations}
        />
    );
});
