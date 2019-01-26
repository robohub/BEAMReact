import * as React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
// import BOTableView from './bizobject/BOTableView';
import BOTableView from './MUITableView';

export default class Composer extends React.Component<RouteComponentProps<{}>, {}> {
    detailLink = this.props.match.path + '/detail';

    render() {  
        return (

            <div>
                    <Route 
                        path={this.detailLink} 
                        render={() => {
                            return 'ROBBO HUBBO';
                        }}
                    />
                    <BOTableView link={this.detailLink}/>
            </div>  
        );
    }
}