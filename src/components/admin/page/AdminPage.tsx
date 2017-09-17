import * as React from 'react';
import { Grid, Sticky } from 'semantic-ui-react';
import ManageMOView from './metaobject/manageMOView';

import SideMenu from './sidebar/semanticSidebar';

export default class Admin extends React.Component {
    state = { visible: true };
    
    toggleVisibility = () => this.setState({ visible: !this.state.visible });

    render() {  
        return (
            <Grid columns={16} padded={true}>
                {/* <Button onClick={this.toggleVisibility}>Toggle Visibility</Button> */}
                <Grid.Column width={3}><Sticky><SideMenu visible={this.state.visible}/></Sticky></Grid.Column>
                <Grid.Column width={13}><ManageMOView/></Grid.Column>
            </Grid>
        );
    }
}  