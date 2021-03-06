import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Paper, withStyles, WithStyles, createStyles, Theme, Grid, TextField, Button, FormControlLabel, Checkbox } from '@material-ui/core';
import { Face, Fingerprint } from '@material-ui/icons';

import { Form, Field, withFormik, FormikProps } from 'formik';
import MDInputField from '../shared/MDInputField';

import { SystemConfigVars, LoginVars } from '../shared/globals';

import { client } from '../../index';
import gql from 'graphql-tag';

export const getUserRelations = gql`
query getUserRelations($moId: ID, $userId: String, $mrId: ID) {
    businessObjects(
        where: {
            AND: [{metaObject: {id: $moId}},
                {name: $userId},{outgoingRelations_some: {metaRelation: {id:$mrId}}}]
        }
    )
    {
        id
        outgoingRelations {
            id
            metaRelation { id }
            oppositeObject { id  }
        }
    }
}
`;

export type UserRelationType = {
    outgoingRelations: {
        metaRelation: {
            id: string
        }
        oppositeObject: { id: string }
    }[]
};

const styles = ({ spacing }: Theme) => createStyles({
    margin: {
        margin: spacing(2),
    },
    padding: {
        padding: spacing(1)
    },
    center: {
        display: 'flex',
        height: 600,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

interface FormValues {
    userid: string;
}

interface Props extends RouteComponentProps<{}>, WithStyles<typeof styles> {
}

const formikEnhancer = withFormik<Props, FormValues>({
    mapPropsToValues: props => {
        return {userid: ''};
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
        LoginVars.USER_ID = values.userid;

        let result = await client.query({
            query: getUserRelations,
            variables: {
                moId: SystemConfigVars.SYSTEMUSER_METAOBJECT_MAPPING,
                userId: LoginVars.USER_ID,
                mrId: SystemConfigVars.USER_RELATED_METARELATION
            }
        });

        // Set default values, before searching for specific templates
        LoginVars.USER_TEMPLATE_ID = SystemConfigVars.DEFAULT_USER_TEMPLATE;
        LoginVars.USER_TEMPLATE_NAME = 'Default template - hard coded';

        let businessObjects = result.data.businessObjects as UserRelationType[];
        if (businessObjects.length) {  // Check if userid is connected to BO via relation defined by USER_RELATED_METARELATION
            businessObjects[0].outgoingRelations.forEach(rel => {
                if (rel.metaRelation.id === SystemConfigVars.USER_RELATED_METARELATION) {
                    const template = SystemConfigVars.USER_TEMPLATE_MAP.get(rel.oppositeObject.id);
                    if (template !== undefined) {  // Check if the BO is mapped to template
                        LoginVars.USER_TEMPLATE_ID = template.id;
                        LoginVars.USER_TEMPLATE_NAME = template.name;
                        return;
                    }
                }
            });
        }

        props.history.push(`/home`);

    },
    displayName: 'Login',
});

class LoginTab extends React.Component<Props & FormikProps<FormValues>> {

    render() {
        const { classes } = this.props;
        return (
            <Form className={classes.center}>
            <Paper className={classes.padding}>
                <div className={classes.margin}>
                    <Grid container={true} spacing={1} alignItems="flex-end">
                        <Grid item={true}>
                            <Face />
                        </Grid>
                        <Grid item={true} md={true} sm={true} xs={true}>
                            <Field
                                name={`userid`}
                                type="text"
                                component={MDInputField}
                                label={'Username'}
                                fullWidth={true}
                                autoFocus={true}
                                required={true}
                            />                        
                        </Grid>
                    </Grid>
                    <Grid container={true} spacing={1} alignItems="flex-end">
                        <Grid item={true}>
                            <Fingerprint />
                        </Grid>
                        <Grid item={true} md={true} sm={true} xs={true}>
                            <TextField id="password" label="Password" type="password" fullWidth={true} required={true} />
                        </Grid>
                    </Grid>
                    <Grid container={true} alignItems="center" justify="space-between">
                        <Grid item={true}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                    />
                                }
                                label="Remember me"
                            />
                        </Grid>
                        <Grid item={true}>
                            <Button disableFocusRipple={true} disableRipple={true} style={{ textTransform: 'none' }} variant="text" color="primary">Forgot password ?</Button>
                        </Grid>
                    </Grid>
                    <Grid container={true} justify="center" style={{ marginTop: '10px' }}>
                        <Button variant="outlined" color="primary" style={{ textTransform: 'none' }} type="submit">Login</Button>
                    </Grid>
                </div>
            </Paper>
            </Form>
        );
    }
}

export const LoginForm = withStyles(styles)(formikEnhancer(LoginTab));
