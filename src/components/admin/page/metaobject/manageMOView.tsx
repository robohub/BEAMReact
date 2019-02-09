import * as React from 'react';
import { Query } from 'react-apollo';
import MOEditView from './MOEditView';
// import { MOEditType } from './Types';
import { allMetaObjectsQuery } from './queries';

export default class ManageMOView extends React.Component {
    
    render() {
      return (
            <Query query={allMetaObjectsQuery}>
                {({ loading, data, error }) => {
                    if (loading) {
                        return <div>Loading</div>;
                    }
                    if (error) {
                        return <h1>ERROR</h1>;
                    } 
                    
                    return (
                        <MOEditView
                            allMetaObjects={data.allMetaObjects}
                            allMetaAttributes={data.allMetaAttributes}
                            // allMetaRelations={allMetaRelations}
                        />
                    );
                }}
            </Query>
        );
    }
}