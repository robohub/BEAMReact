import * as React from 'react';
import { Query, ChildProps } from 'react-apollo';
// import { Segment, Dropdown } from 'semantic-ui-react';
import { DialogContainer } from 'react-md';
import BOEditContainer from './BOEditContainer';
import { allMOQuery } from './queries';

import {
    SelectField, Grid, Cell, Button,
} from 'react-md';
import { BOEditType } from './Types';

interface RObject {
    id: string; name: string;
}

interface Response {
    metaObjects: RObject[];
}

type DropType = {
    label: string;
    value: string;
};

interface Props {
    setSelectedBO: (bo: BOEditType) => void;
}

export default class SelectBOType extends React.Component<ChildProps<{}, Response> & Props> {

    state = { selected: false, selectedId: '', boType: '', visible: false };
    
    show = () => {
        this.setState({ visible: true });
        this.props.setSelectedBO(null); // Close any other editing form
      }
    
    hide = () => {
        this.setState({ visible: false });
    }

    render() {
        return (
            <Query query={allMOQuery}>
                {({ loading, data: { metaObjects }, error, refetch }) => {
                    if (loading) {
                        return <div>Loading</div>;
                    }
                    if (error) {
                        return <h1>ERROR</h1>;
                    }

                    // tslint:disable-next-line:no-console
                    console.log('SelectBOTYpe , nytt BO, renderar...');
                      
                    var objs = new Array<DropType>(0);
                    metaObjects.map((o: RObject) => {
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
                                <DialogContainer
                                    id="createBODialog"
                                    visible={this.state.visible}
                                    onHide={this.hide}
                                    title={'Add Business Object: ' + this.state.boType}
                                    focusOnMount={false}
                                    width={480}
                                >
                                    {this.state.selected ?
                                         <BOEditContainer newObject={true} metaID={this.state.selectedId}/> : '...'}
                                </DialogContainer >

                            </Cell>
                        </Grid>
                    );
                }}
            </Query>
        );
    }
}