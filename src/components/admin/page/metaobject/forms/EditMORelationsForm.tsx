import * as React from 'react';

import { MOPropertiesType, MORelationItemType } from '../Types';
import { FieldArray, ArrayHelpers } from 'formik';
import { Grid, TextField, Button, Divider, Table, TableHead, TableRow, TableCell, TableBody, Select, InputLabel, MenuItem, Input,
    RadioGroup, FormControl, FormLabel, FormControlLabel, Radio, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteForeverOutlined';

type FormValues = MORelationItemType[];  // RH temporärt?

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from './../../../../shared/style';

interface RelProps {
    metaObjects: MOPropertiesType[];
    values: FormValues;
    arrayHelpers: ArrayHelpers;
    // tslint:disable-next-line:no-any
    classes: any;
}

class RenderRelations extends React.Component<RelProps> {

    state = { showOppositeName: true, selectedBOId: '', selectedBOName: '', relName: '',
              multi: 'One', corrMulti: 'One', corrRelName: '' };
    
    switchOnewWayOnOff = () => {
        this.setState({ showOppositeName: !this.state.showOppositeName});
    }

    addRelationClick = () => {
        let rel = {
            oppositeName: this.state.relName,
            oppositeObject: { id: this.state.selectedBOId, name: this.state.selectedBOName },
            oppositeRelation: {
                id: '',
                multiplicity: this.state.corrMulti,
                oppositeName: this.state.corrRelName
            },
            multiplicity: this.state.multi,
        };
        this.props.arrayHelpers.push(rel);
    }

    multiSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({multi: event.target.value});
    }

    corrMultiSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({corrMulti: event.target.value});
    }

    render() {
        const { metaObjects } = this.props;

        return (
            <div>
                <Grid container={true}>
                    <TextField
                        className={this.props.classes.textField}
                        id="relName"
                        label={'Relation Name'}
                        value={this.state.relName}
                        placeholder="<Write something...>"
                        onChange={event => this.setState({relName: event.target.value})}
                    />
                    <FormControl className={this.props.classes.button}>  {/* RH TODO: coordinate styles with better context driven names! */}
                        <InputLabel htmlFor="relobjinput" className={this.props.classes.select}>Related Object Type</InputLabel>
                        <Select 
                            className={this.props.classes.select}
                            id="relboSelect"
                            value={this.state.selectedBOId}
                            // placeholder="<Select an object type>"
                            onChange={event => {
                                // this.setState( {selectedBOId: event.target.value, selectedBOName: this.props.metaObjects[event.target.id].name});
                                this.setState( {selectedBOId: event.target.value as string, selectedBOName: event.target.name});
                            }}
                            input={<Input name="MetaObject" id="relobjinput"/>}
                        >
                            {metaObjects.map((mo, index) => (
                                <MenuItem key={mo.id} value={mo.id} id={index.toString()}>
                                    {mo.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl className={this.props.classes.button}>
                        <FormLabel>Multiplicity</FormLabel>
                        <RadioGroup
                            name="sel1"
                            // className={classes.group}
                            value={this.state.multi}
                            onChange={this.multiSelect}
                        >
                            <FormControlLabel value="One" control={<Radio />} label="One" />
                            <FormControlLabel value="Many" control={<Radio />} label="Many" />
                        </RadioGroup>
                    </FormControl>
                    <Grid item={true} xs={6}>
                        {this.state.showOppositeName ?
                            <TextField
                                className={this.props.classes.textField}
                                id="corrName"
                                label="Corresponding Relation Name"
                                value={this.state.corrRelName}
                                onChange={event => this.setState({corrRelName: event.target.value})}
                            />
                            :
                            <div/>
                        }                    
                    </Grid>
                    <Grid item={true} xs={6}>
                        {this.state.showOppositeName ?
                            <FormControl>
                                <FormLabel>Corresponding Multiplicity</FormLabel>
                                <RadioGroup
                                    name="sel2"
                                    // className={classes.group}
                                    value={this.state.corrMulti}
                                    onChange={this.corrMultiSelect}
                                >
                                    <FormControlLabel value="One" control={<Radio />} label="One" />
                                    <FormControlLabel value="Many" control={<Radio />} label="Many" />
                                </RadioGroup>
                            </FormControl>
                            :
                            <div/>
                        }
                    </Grid>
                    <Grid item={true} xs={12}>
                        <Button
                            className={this.props.classes.button}
                            color={'primary'}
                            variant={'contained'}
                            onClick={this.addRelationClick}
                            disabled={this.state.relName === '' || this.state.selectedBOId === '' || this.state.corrRelName === ''}
                        >
                            Add Relation
                        </Button>
                    </Grid>
                </Grid>

                <Divider style={{marginTop: 10}}/>
                
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Opposite Object</TableCell>
                            <TableCell>Multiplicity</TableCell>
                            <TableCell>Delete</TableCell> 
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.values && this.props.values.length !== 0 ?
                            this.props.values.map((rel, index) =>
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography variant="body1">{rel.oppositeName}</Typography>
                                    </TableCell>
                                    <TableCell>{rel.oppositeObject.name}</TableCell>
                                    <TableCell>{rel.multiplicity}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => this.props.arrayHelpers.remove(index)} color={'secondary'} ><DeleteIcon/></Button>
                                    </TableCell>
                                </TableRow>                            
                            )
                            :
                            <TableRow>
                                <TableCell>
                                    No relations defined...
                                </TableCell>
                            </TableRow>

                        }
                    </TableBody>
                </Table>

            </div>
        );
    }
}

interface MOEditFormProps extends WithStyles<typeof styles> {
    values: FormValues;
    metaObjects: MOPropertiesType[];    
}

class MOEditRelationsForm extends React.Component<MOEditFormProps> {

    render() {
        const { metaObjects, values } = this.props;
        return (
                <FieldArray
                    name="relations"  // Check mapPropsToValues in MOEditForm
                    render={arrayHelper => <RenderRelations arrayHelpers={arrayHelper} metaObjects={metaObjects} values={values} classes={this.props.classes}/>}
                />
        );
    }
}

export default withStyles(styles)(MOEditRelationsForm);
