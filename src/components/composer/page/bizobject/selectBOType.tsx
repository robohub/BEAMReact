import * as React from 'react';
import { gql, graphql, ChildProps } from 'react-apollo';
// import { Segment, Dropdown } from 'semantic-ui-react';
import EditBOtModal from './editBOModal';

import {
    SelectField, Grid, Cell, Button,
} from 'react-md';

const allMOQuery = gql`
query allMetaObjects {
  allMetaObjects {
    id
    name
  }
}
`;

interface Response {
    allMetaObjects: { id: string, name: string }[];
}

type DropType = {
    label: string;
    value: string;
};

class SelectBOType extends React.Component<ChildProps<{}, Response>> {

    state = { selected: false, selectedId: '', boType: '', visible: false};
    
    show = () => {
        this.setState({ visible: true });
      }
    
    hide = () => {
        this.setState({ visible: false });
    }
       
    render() {
        const { loading, allMetaObjects } = this.props.data;
        
        if (loading) {
            return <div>Loading</div>;
        }

        var objs = new Array<DropType>(0);
        allMetaObjects.map(o => {
            objs.push({label: o.name, value: o.id});
        });

        const changeSelected = ((value: string, index: number, event: React.MouseEvent<HTMLElement>) => {
            this.setState({selected: true, selectedId: value, boType: objs[index].label});
        });

        return (         
            <Grid className="md-paper--1">
                <Cell size={2}>
                    <SelectField
                        id="moSelect"
                        value={this.state.selectedId}
                        placeholder="Select Type"
                        menuItems={objs}
                        onChange={changeSelected}
                        fullWidth={true}
                    />
                </Cell>
                <Cell align="middle" size={10}>
                    <Button disabled={!this.state.selected} raised={true} primary={true} onClick={this.show}>Create BO</Button>
                    <EditBOtModal
                        selected={this.state.selected}
                        visible={this.state.visible}
                        metaID={this.state.selectedId}
                        boType={this.state.boType}
                        hide={this.hide}
                    />
                </Cell>
            </Grid>
        );
    }
}

export default graphql<Response>(allMOQuery)(SelectBOType);
