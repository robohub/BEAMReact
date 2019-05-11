import * as React from 'react';
import { ChildProps, Query } from 'react-apollo';
import EditBOView from './BOEditView';
import { MOQuery } from './queries';
import { MOResponse, MetaObjectType } from './Types';
import { BOEditType } from '../../../../domain/utils/boUtils';

type InputProps = {
    newObject: boolean;
    metaID: string;
    bizObject?: BOEditType;
    selectedBO?: string;
};

interface State {
    myBO: string;
}

export default class BOEditContainer extends React.Component<ChildProps<InputProps, MOResponse>, State> {
    constructor(props: ChildProps<InputProps, MOResponse>, state: State) {
        super(props);
        if (props.bizObject) {
            this.state = { myBO: props.bizObject.id};
        }
    }
    render() {
        
        let id = this.props.metaID;
        return (
            this.props.newObject || this.state.myBO === this.props.selectedBO ?
                (
                    <Query query={MOQuery} variables={{ id: id}}>
                        {({ data, loading, error }) => {
            
                            if (loading) { return <div>Loading</div>; }
                            
                            if (error) { return <div>ERROR: {error.message}</div>; }             
/*                            
                            if (this.props.newObject) {
                                // tslint:disable-next-line:no-console
                                console.log(' ------ ----- BOEditContainer renderar NEW BO !!!');
                            } else {
                                // tslint:disable-next-line:no-console
                                console.log(' ------ ----- BOEditContainer renderar BO !!! BO.id=' + this.props.bizObject.id);
                            }
                            // tslint:disable-next-line:no-console
                            console.log(' ------ ----- BOEditContainer renderar med MQQuery !!! MO.id=' + id);
                            
                            const data2: MOResponse = client.readQuery({query: MOQuery, variables: {id: id} });
                            // tslint:disable-next-line:no-console
                            console.log(data2);
*/       
                            return (
                                <EditBOView 
                                    newObject={this.props.newObject} 
                                    metaobject={data.metaObject as MetaObjectType} 
                                    bizObject={this.props.bizObject}
                                />
                            );
                        }}
                    </Query>
                )
                :
                'hej'
        );
    }
}
