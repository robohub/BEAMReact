import * as React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { Grid, /*Button*/ } from 'semantic-ui-react';
import BOTableView from './bizobject/BOTableView';
import BizObjDetailed from './/subPage/bizObjDetailed';
// import Diagram from '../../diagramming/diagram';

import SideMenu from '../../admin/page/sidebar/semanticSidebar';

export default class Composer extends React.Component<RouteComponentProps<{}>, {}> {
    state = { visible: true };
    detailLink = this.props.match.path + '/detail';

    toggleVisibility = () => this.setState({ visible: !this.state.visible });

    render() {  
        return (
            <div>
                <Grid columns={16} divided={true} padded={true}>
                    {/* <Button onClick={this.toggleVisibility}>Toggle Visibility</Button> */}
                    <Grid.Column width={3}><SideMenu visible={this.state.visible}/></Grid.Column>
                    <Grid.Column width={13}>
                        <Route 
                            path={this.detailLink} 
                            render={() =>
                                <BizObjDetailed name={'Robert Hubbo'}/> 
                            } 
                        />
                        <BOTableView link={this.detailLink}/>
                    </Grid.Column>
                </Grid>
            </div>  
        );
    }
}