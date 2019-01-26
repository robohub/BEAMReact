import * as React from 'react';
import { Query, ChildProps, /*QueryProps*/ } from 'react-apollo';
import BOTableRow from './BOTableRow';
import { BizObjectsType, BOEditType } from './../Types';
import SelectBOType from './selectBOType';
import { allBOQuery } from './queries';
import EditDrawer from './DrawerEditBO';

import {
    DataTable,
    TableHeader,
    TableBody,
    TableRow,
    TableColumn,
  } from 'react-md';

type Response = BizObjectsType;

interface InputProps {
    link: string;
}

interface State {
    showEditForm: boolean;
    selectedBO: BOEditType;
    allBusinessObjects: BizObjectsType;
}

export default class BOTableView extends React.Component<ChildProps<InputProps, Response>, State> {
    
    constructor(props: InputProps) {
        super(props);
        this.state = { showEditForm: false, selectedBO: null, allBusinessObjects: null };
    }

    switchEditOnOff = (event: React.MouseEvent<HTMLElement>) => {
        this.setState(
            {
                selectedBO: this.state.allBusinessObjects[event.currentTarget.id], 
                showEditForm: !this.state.showEditForm,
            });
    }

    handleVisibility = (showEditForm: boolean) => {
        this.setState({ showEditForm });
    }

    robsetobjs = (objs: BizObjectsType) => {
        this.setState({allBusinessObjects: objs});
    }
    
    render() {
          return (
            <Query
                query={allBOQuery}
                onCompleted={data => { this.robsetobjs(data.allBusinessObjects); }}
                fetchPolicy={'cache-and-network'} 
            >
              {({ loading, data: {allBusinessObjects}, error }) => {
                if (loading) {
                  return <div>Loading</div>;
                }
                if (error) {
                    return <h1>ERROR</h1>;
                }

                return (
                    <div>
                        <SelectBOType />
                        <DataTable plain={true}>
                            <TableHeader>
                                <TableRow>
                                    <TableColumn>Object Name</TableColumn>
                                    <TableColumn>Actions</TableColumn>
                                    <TableColumn>Type</TableColumn>
                                    <TableColumn>State</TableColumn>
                                    <TableColumn>Properties</TableColumn>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allBusinessObjects.map((o: BOEditType, index: number) =>
                                    <BOTableRow
                                        key={o.id}
                                        bizObject={o}
                                        showEditForm={this.switchEditOnOff}
                                        index={index}
                                    />
                                )}
                            </TableBody>
                        </DataTable>
                        <EditDrawer visible={this.state.showEditForm} handleVisibility={this.handleVisibility} bizObject={this.state.selectedBO}/>
                    </div>
                );
              }}
            </Query>
          );
    }
}