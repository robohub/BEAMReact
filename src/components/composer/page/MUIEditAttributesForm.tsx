import * as React from 'react';
// import { Field, reduxForm, InjectedFormProps, WrappedFieldProps, GenericField, /*GenericFieldArray, FormSection*/ } from 'redux-form';
import { BOEditType , MOResponse } from './Types';

import { Paper, Button, /* SelectField, TextField, */ } from 'react-md';
import MDInputField from '../../shared/MDInputField';

import { withFormik, FormikProps, Field, FieldArray, Form } from 'formik';

interface FormAttributes {
    name: string;
    maid: string;
    bizattrval: string;
}

export interface AttrFormValues {
    bizAttributes: FormAttributes[];
}

interface BOEditFormProps {
    newObject: boolean;
    metaObject: MOResponse;
    bizObject?: BOEditType;
    onSubmit: (values: AttrFormValues) => void;
}

const formikEnhancer = withFormik<BOEditFormProps, AttrFormValues>({
    mapPropsToValues: props => {
        const { attributes: metaAttrs } = props.metaObject.MetaObject;
        var formAttrs = new Array<FormAttributes>(0);
        
        if (props.newObject) {
            metaAttrs.map(ma => {
                formAttrs.push({ maid: ma.id, bizattrval: '', name: ma.name});
            });
        } else {
            // tslint:disable-next-line:no-console
            console.log(`Editing:\n-----------------\n${props.bizObject.name}: ${props.bizObject.metaObject.name}`);
            const { bizAttributes } = props.bizObject;
            
            // Attributes
            metaAttrs.map(ma => {
                let value: string = '';
                for (let i = 0; i < bizAttributes.length; i++) {
                    if (ma.id === bizAttributes[i].metaAttribute.id) {
                        value = bizAttributes[i].value;
                        break;
                    }
                }
                formAttrs.push({ maid: ma.id, bizattrval: value, name: ma.name});
            });
        }
        
        // tslint:disable-next-line:no-console
        console.log(`Your init attrs:\n\n${JSON.stringify(formAttrs, null, 2)}`);
        return {
            bizAttributes: formAttrs,
        };

    },
    handleSubmit: (values: AttrFormValues, { props, setSubmitting }) => {   // async?  Se fullstack-graphql-airbnb-clone/packages/web/src/modules/register/ui/RegisterView.tsx
        setSubmitting(false);
        props.onSubmit(values);
    },
    displayName: 'Roberts BO Edit Form',
});

const InnerForm: React.SFC<BOEditFormProps & FormikProps<AttrFormValues>> = (props) => (
    // <form onSubmit={props.handleSubmit}>
    <Form>
        <FieldArray
            name="bizAttributes"
            render={() => (
                <div>
                    {props.values.bizAttributes.length > 0 ?
                        <Paper zDepth={0}>
                            {props.values.bizAttributes.map((attr, index) => (
                                <Paper zDepth={0} key={index}>
                                    <Field
                                        name={`bizAttributes.${index}.bizattrval`}
                                        type="text"
                                        component={MDInputField}
                                        label={attr.name}
                                    />
                                </Paper>
                            ))}
                        </Paper>
                        :
                        <div>- No attributes! -</div>
                    }
                </div>
            )}
        />
        <Button type="submit" primary={true} raised={true}>Save</Button>
    </Form>
);

export const BOEditAttributesForm = formikEnhancer(InnerForm);
