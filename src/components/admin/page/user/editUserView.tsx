import * as React from 'react';
import { withStyles, WithStyles, Button, Paper,  } from '@material-ui/core';

import { Form, Field, withFormik, FormikProps, FormikErrors } from 'formik';
import MDInputField from '../../../shared/MDInputField';

import * as Globals from '../../../shared/globals';
import { styles } from '../../../shared/style';
import { client } from '../../../../index';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const getUserQuery = gql`
query getUser($id:ID) {
  user(where: {id: $id}) {
    id
    userid
    name
    password
  }
}
`;

const saveUserMutation = gql`
mutation saveUser($id:ID, $name:String, $userid: String, $password: String) {
    upsertUser(
        where: {id: $id}
            create: {name: $name, userid: $userid, password: $password}
            update: {name: $name, userid: $userid, password: $password}
    ) {
        id 
    }
}
`;

const saveUserBoMutation = gql`
mutation createUserBo(
    $boid: ID,
    $moid: ID,
    $name: String,
    $attrs: [BizAttributeCreateWithoutBusinessObjectInput!],
    $brValues: [BizAttributeUpdateManyWithWhereNestedInput!]
  ) {
    upsertBusinessObject(
        where: {id: $boid}
        create: {
            metaObject: { connect: { id: $moid}},
            name: $name,
            bizAttributes: {create: $attrs},
        }
        update: {
            name: $name
            bizAttributes: {updateMany: $brValues}
        }
    ) {
        id
        name
        state
        metaObject {
            id
            name
        }
        bizAttributes {
            id
            metaAttribute
            {
                id
                name
            }
            value
        }
    } 
}
`;

export interface FormValues {
    userid: string;
    name: string;
    password: string;
}

interface Props extends WithStyles<typeof styles> {
    userid: string;
    name: string;
    password: string;
    onSubmit: (values: FormValues) => void;
}

const formikEnhancer = withFormik<Props, FormValues>({
    mapPropsToValues: props => {
        return {
            userid: props.userid,
            name: props.name,
            password: props.password
         };
    },
    validate: values => {
        let errors: FormikErrors<FormValues> = {};
        if (values.name === '') {
            errors.name = '* Name is mandatory...';
        }
        if (values.userid === '') {
            errors.userid = '* Userid is mandatory...';
        }
        return errors;
    },
    handleSubmit: async (values: FormValues, { setSubmitting, props }) => {
        setSubmitting(false);
        props.onSubmit(values);
    },
    displayName: 'User Edit Form',
});

class InnerForm extends React.PureComponent<Props & FormikProps<FormValues>> {
    render() {
        const { classes, errors, touched } = this.props;

        return (
            <Form>
                <Paper>
                    <div>
                        <Field
                            name={`name`}
                            component={MDInputField}
                            label={'Name'}
                        />
                        {errors.name && touched.name ? (<div className={classes.errorText}>{errors.name}</div>) : null}
                    </div>
                    <div>
                        <Field
                            name={`userid`}
                            component={MDInputField}
                            label={'User ID'}
                        />  
                        {errors.userid && touched.userid ? (<div className={classes.errorText}>{errors.userid}</div>) : null}
                        </div>
                    <Field
                        name={`password`}
                        component={MDInputField}
                        label={'password'}
                    />
                    <div>
                        <Button variant="contained" color="primary" style={{ textTransform: 'none' }} type="submit">Save</Button>
                    </div>
                </Paper>
            </Form>
        );
    }
}

const EditUserForm = withStyles(styles)(formikEnhancer(InnerForm));

interface ViewProps extends WithStyles<typeof styles> {
    newObject: boolean;
    selectedUserId?: string;
    whenSaved: () => void;
}

interface State {
    myUserId: string;
}

class EditUser extends React.PureComponent<ViewProps, State> {
    constructor(props: ViewProps) {
        super(props);
        this.state = { myUserId: props.selectedUserId};
    }

    async saveSystemUser(values: FormValues) {
        await client.mutate({
            mutation: saveUserMutation,
            variables: {
                id: this.state.myUserId,
                name: values.name,
                userid: values.userid,
                password: values.password
            }
        });
    }

    async saveUserBo(boid: string, values: FormValues) {
        
        let createAttrs = new Array<{metaAttribute: {connect: {id: string}}, value: string}>();
        if (boid === '') {
            // tslint:disable-next-line:max-line-length
            createAttrs.push({metaAttribute: {connect: {id: Globals.SystemConfigVars.SYSTEMUSER_USERID_MA_MAPPING}}, value: values.userid});  // RH TODO Hard coded meta-attribut, ska vara system variabel, sätts i User mapping...
        }

        await client.mutate({
            mutation: saveUserBoMutation,
            variables: {
                moid: Globals.SystemConfigVars.SYSTEMUSER_METAOBJECT_MAPPING,
                boid: '',
                name: values.name,
                attrs: createAttrs,
                brValues: []
            }
        });           
    }

    onSave = async (values: FormValues) => {
        await Promise.all([this.saveSystemUser(values), this.saveUserBo('', values)]);
        this.props.whenSaved();
    }

    render() {
        
        return (
            this.state.myUserId === this.props.selectedUserId ?
                (
                    <Query query={getUserQuery} variables={{ id: this.state.myUserId }}>
                        {({ data, loading, error }) => {
                            if (loading) { return <div>Loading</div>; }
                            if (error) { return <div>ERROR: {error.message}</div>; }             
                            
                            return (
                                <div>
                                    <EditUserForm
                                        userid={data.user.userid}
                                        name={data.user.name}
                                        password={data.user.password}
                                        onSubmit={this.onSave}
                                    />

                                </div>
                            );
                        }}
                    </Query>
                )
                :
                '' 
        );
    }

}

export const EditUserView = withStyles(styles)(EditUser);
