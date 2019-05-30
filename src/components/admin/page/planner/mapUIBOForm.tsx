import * as React from 'react';
import { updateConfig } from './queries';
import { client } from '../../../../index';

import { withFormik, FormikProps, FieldArray, /*FormikErrors*/ } from 'formik';

import { /* Dialog, DialogTitle,*/ Button, Table, TableHead, TableRow, TableCell, Typography, TableBody, Grid } from '@material-ui/core';
import RightArrowIcon from '@material-ui/icons/ArrowForward';
import LeftArrowIcon from '@material-ui/icons/ArrowBack';

import { PlanConfig, FormValues, MetaRelation } from './types';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';

interface Props extends WithStyles<typeof styles> {
    open: boolean;
    onClose: (saved: boolean, message: string) => void;
    planMO?: string;
    config?: PlanConfig;
    availableMetaRelations?: MetaRelation[];
    bindSubmitForm?: (submitForm: () => void) => void;  // To be able to submit form in the parent component!
}

const formikEnhancer = withFormik<Props, FormValues>({
    mapPropsToValues: props => {

        // Filter away alredy selected items from available
        let available: MetaRelation[] = [];
        var selected = props.config ? props.config.uiMoRelations : [];
        if (props.availableMetaRelations) {
            props.availableMetaRelations.map(mr => {
                var found = false;
                for (var i = 0; i < selected.length; i++) {
                    if (mr.id === selected[i].id) {
                        found = true;
                        break;
                    }
                }
                if (!found) { available.push(mr); }
            });
        }

        return {
            available: available,
            selected: selected,
        };
    },
    validate: values => {
    /*    let errors: FormikErrors<{item: string}> = {};
        if (values.item !== undefined && values.item.id === values.plan.id) {
            errors.item = 'Objects cannot be the same!';
        }
        return errors;*/
    },
    handleSubmit: async (values: FormValues, { props, setSubmitting }) => {
        setSubmitting(false);
        var itemIds = new Array< {id: string}>();
        values.selected.map(mr => {
            itemIds.push({id: mr.id});
        });
        try {
            await client.mutate({
                mutation: updateConfig,
                // fetchPolicy: 'network-only',
                variables: { 
                    id: props.config ? props.config.id : '',
                    planId: props.config ? props.config.uiMoPlan.id : props.planMO,
                    itemIds: itemIds
                }
            }).then(() => {
                props.onClose(true, 'Configuration saved');
            }).catch((e) => {
                props.onClose(false, e);
            });
        } catch (e) {
            alert('Error when trying to save configuration: ' + e);
            props.onClose(false, '');
        }
        // tslint:disable-next-line:no-console
        console.log({values});
    },
    displayName: 'Mapping MO to UI',
});

class ConnectForm extends React.Component<Props & FormikProps<FormValues>> {

    handleClose = () => {
        this.props.onClose(false, '');
    }

    render() {
        const { /* touched, errors,*/ classes, values, handleSubmit, submitForm, bindSubmitForm  } = this.props;
        
        if (bindSubmitForm) {  // external or internal submit
            bindSubmitForm(submitForm);
        }

        return (
            <form className={classes.root} onSubmit={handleSubmit}>
                <Grid container={true} spacing={2}>
                    <Grid item={true} xs={6}>
                        Available Items
                        <FieldArray
                            name="available"
                            render={arrayHelpers => {
                                return (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Item</TableCell>
                                                <TableCell>Plan Relation</TableCell>
                                                <TableCell>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {values.available.length ?
                                                values.available.map((mr, index) => 
                                                    <TableRow key={index} id={mr.id} >
                                                        <TableCell style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                                                            <Typography variant="body1">{mr.oppositeRelation.incomingObject.name}</Typography>
                                                        </TableCell>
                                                        <TableCell>{mr.oppositeName} </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                onClick={() => {
                                                                    values.selected.push(mr);
                                                                    arrayHelpers.remove(index);
                                                                }}
                                                                variant={'text'}
                                                                color={'secondary'}
                                                            >
                                                                <RightArrowIcon/>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                                :
                                                <TableRow>
                                                    <TableCell>
                                                        No Items available...
                                                    </TableCell>
                                                </TableRow>
                                            }
                                        </TableBody>
                                    </Table>
                                );
                            }}
                        />
                    </Grid>
                    <Grid item={true} xs={6}>
                        Selected Items
                        <FieldArray
                            name="selected"
                            render={arrayHelpers => {
                                return (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Item</TableCell>
                                                <TableCell>Plan Relation</TableCell>
                                                <TableCell>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {values.selected.length ?
                                                values.selected.map((mr, index) => 
                                                    <TableRow key={index} id={mr.id} >
                                                        <TableCell style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                                                            <Typography variant="body1">{mr.oppositeRelation.incomingObject.name}</Typography>
                                                        </TableCell>
                                                        <TableCell>{mr.oppositeName} </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                onClick={() => {
                                                                    values.available.push(mr);
                                                                    arrayHelpers.remove(index);
                                                                }}
                                                                variant={'text'}
                                                                color={'secondary'}
                                                            >
                                                                    <LeftArrowIcon/>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                                :
                                                <TableRow>
                                                    <TableCell>
                                                        No Items selected...
                                                    </TableCell>
                                                </TableRow>
                                            }
                                        </TableBody>
                                    </Table>
                                );
                            }}
                        />
                    </Grid>
                </Grid>
                {!bindSubmitForm ?
                    <Button className={classes.button} variant={'contained'} color={'primary'} onClick={submitForm}>Save</Button>
                    :
                    ''
                }
            </form>
        );
    }
}

export default withStyles(styles)(formikEnhancer(ConnectForm));