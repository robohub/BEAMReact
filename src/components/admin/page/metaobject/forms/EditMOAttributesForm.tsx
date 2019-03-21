import * as React from 'react';
import { FieldArray } from 'formik';

import { MOAttributeItemType } from './../Types';
import { Grid, Select, Button, Divider, TableRow, TableBody, Table, TableHead, TableCell, MenuItem, FormControl, InputLabel, Input, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteForeverOutlined';

type FormValues = MOAttributeItemType[];  // RH TODO: temporärt?

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from './../../../../shared/style';

interface MOEditFormProps extends WithStyles<typeof styles> {
    values: FormValues;
    metaAttributes: MOAttributeItemType[];    
}

class MOEditAttributesForm extends React.Component<MOEditFormProps> {

    state = { selectedMOId: '', selectedMOIndex: 0};

    handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState( {selectedMOId: event.target.value, selectedMOIndex: event.currentTarget.id});
    }

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
                        <Grid container={true}>
                            <Grid item={true}>
                                <FormControl className={this.props.classes.button}>  {/* RH TODO: coordinate styles with better context driven names! */}
                                    <InputLabel htmlFor="input" className={this.props.classes.select}>
                                        Selected Attribute
                                    </InputLabel>
                                    <Select
                                        className={this.props.classes.select}
                                        value={this.state.selectedMOId}
                                        onChange={this.handleChange}
                                        input={<Input id="input"/>}
                                    >
                                        {dropList.map((opt, index) => (
                                            <MenuItem key={index} value={opt.value} id={index.toString()}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item={true}>
                                <Button
                                    className={this.props.classes.selectButton}
                                    color={'primary'}
                                    variant={'contained'}
                                    onClick={() =>
                                        arrayHelpers.push(metaAttributes[this.state.selectedMOIndex])
                                    }
                                    disabled={this.state.selectedMOId === ''}
                                >
                                    Add Attribute
                                </Button>
                            </Grid>
                        </Grid>
                        <Divider style={{marginTop: 10}}/>
                        <Table className={this.props.classes.button}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.props.values && this.props.values.length !== 0 ?
                                    this.props.values.map((attr, index) =>
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Typography variant="body1">{attr.name}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {attr.type}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="small" onClick={() => arrayHelpers.remove(index)} color={'secondary'} variant={'text'}>
                                                    <DeleteIcon/>
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                    :
                                    <TableRow>
                                        <TableCell>
                                            No attributes defined...
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </div>
                }
            />
        );
    }
}

export default withStyles(styles)(MOEditAttributesForm);
