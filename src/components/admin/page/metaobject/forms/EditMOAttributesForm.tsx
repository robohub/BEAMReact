import * as React from 'react';
import { FieldArray, /* ArrayHelpers */ } from 'formik';

import { FontIcon, Divider, SelectField, Button, Grid, Cell, DataTable, TableBody, TableRow, TableColumn, TableHeader } from 'react-md';
import { MOAttributeItemType } from './../Types';

type FormValues = MOAttributeItemType[];  // RH temporärt?

interface MOEditFormProps {
    values: FormValues;
    metaAttributes: MOAttributeItemType[];    
}

export default class MOEditAttributesForm extends React.Component<MOEditFormProps> {

    state = { selectedMOId: '', selectedMOIndex: 0};

    render() {
        const { metaAttributes } = this.props;
        
        var dropList = new Array<{label: string, value: string}>(0);
        metaAttributes.map(a => {
            dropList.push({label: a.name, value: a.id});
        });

        return (
            <FieldArray
                name="attributes" // Check mapPropsToValues in MOEditForm
                render={arrayHelpers => 
                    <div>
                        <Grid >
                            <Cell size={6} >
                                <SelectField
                                    id="moSelect"
                                    label="Select Attribute"
                                    value={this.state.selectedMOId}
                                    placeholder="Select Attribute"
                                    menuItems={dropList}
                                    onChange={(value, index) => {
                                        this.setState( {selectedMOId: value, selectedMOIndex: index});
                                    }}
                                    fullWidth={true}
                                />
                            </Cell>
                            <Cell size={6} align="bottom">
                                <Button
                                    primary={true}
                                    raised={true}
                                    onClick={() =>
                                        arrayHelpers.push(metaAttributes[this.state.selectedMOIndex])
                                    }
                                    disabled={this.state.selectedMOId === ''}
                                >
                                    Add Attribute
                                </Button>
                            </Cell>
                        </Grid>
                        <Divider/>
                        <DataTable plain={true}>
                            <TableHeader>
                                <TableRow>
                                    <TableColumn>Name</TableColumn>
                                    <TableColumn>Type</TableColumn>
                                    <TableColumn>Action</TableColumn>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {this.props.values && this.props.values.length !== 0 ?
                                    this.props.values.map((attr, index) =>
                                        <TableRow key={index}>
                                            <TableColumn>
                                                {attr.name}
                                            </TableColumn>
                                            <TableColumn>
                                                {attr.type}
                                            </TableColumn>
                                            <TableColumn>
                                                <Button size="small" onClick={() => arrayHelpers.remove(index)} secondary={true} flat={true} iconEl={<FontIcon>delete_forever</FontIcon>}>
                                                    Delete
                                                </Button>
                                            </TableColumn>
                                        </TableRow>
                                    )
                                    :
                                    <TableRow>
                                        <TableColumn>
                                            No attributes defined...
                                        </TableColumn>
                                    </TableRow>
                                }
                            </TableBody>
                        </DataTable>
                    </div>
                }
            />
        );
    }
}
