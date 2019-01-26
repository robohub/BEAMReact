import * as React from 'react';
// import { Field, reduxForm, InjectedFormProps, WrappedFieldProps, GenericField, /*GenericFieldArray, FormSection*/ } from 'redux-form';
import { BOEditType , MOResponse } from './Types';

import { Paper, Button, /* SelectField, TextField, */ } from 'react-md';
import MDSelectField from '../../shared/MDSelectField';
import MDMultiSelectField from '../../shared/MDMultiSelectField';

import { withFormik, FormikProps, Field, FieldArray, Form } from 'formik';

interface FormRelations {
    name: string;
    metarelid: string;
    bizrelbizobjs: string | string[];
}

export interface RelationsFormValues {
    bizRelations: FormRelations[]; 
}

interface BOEditFormProps {
    newObject: boolean;
    metaObject: MOResponse;
    bizObject?: BOEditType;
    onSubmit: (values: RelationsFormValues) => void;
}

const formikEnhancer = withFormik<BOEditFormProps, RelationsFormValues>({
    mapPropsToValues: props => {
        const { outgoingRelations: metaRels } = props.metaObject.MetaObject;
        var formRels = new Array<FormRelations>(0);
        
        if (props.newObject) {
            metaRels.map(mr => {
//                let value = (mr.multiplicity === 'Many') ? [] : '';
                let value: string | string[] = '';
                if (mr.multiplicity === 'Many') {
                    value = ['Many relation - not implemented!!'];
                }
                formRels.push({ name: mr.oppositeName, metarelid: mr.id, bizrelbizobjs: value});
            });
        } else {
            // tslint:disable-next-line:no-console
            console.log(`Editing:\n-----------------\n${props.bizObject.name}: ${props.bizObject.metaObject.name}`);
            const { outgoingRelations } = props.bizObject;

            // Relations
            // -------- var bizrelIdMappings = new Array<BizRelMetaMapType>(0);
            var relMap = new Map<string, { value: string, name: string }>();
            
            metaRels.map(mr => {
                let found = false;
                for (let i = 0; i < outgoingRelations.length; i++) {
                    if (mr.id === outgoingRelations[i].metaRelation.id) {
                        found = true;
                        let value = outgoingRelations[i].oppositeObject.id;
                        // -------- bizrelIdMappings.push({bizkey: outgoingRelations[i].id, metaRelationId: mr.id, oppositeObjectId: value});
                        if (mr.multiplicity === 'Many') {
                            if (relMap[mr.id] === undefined) {
                                relMap[mr.id] = [{value: value, name: mr.oppositeName}];
                            } else {
                                relMap[mr.id].push({value: value, name: mr.oppositeName});
                            }
                        } else {
                            formRels.push({ name: mr.oppositeName, metarelid: mr.id, bizrelbizobjs: value});
                            break;
                        }
                    }
                }
                if (!found) {  // Metarelation has no outgoing relations for the business object, add empty string
                    formRels.push({ name: mr.oppositeName, metarelid: mr.id, bizrelbizobjs: []});
                }
            });
            // Fix rels with 'many' relations, map -> array
            for (var key in relMap) {
                if (relMap[key] !== undefined) {  // TSLint requires this! Read on StackOverflow
                    var relarr = [];
                    let name = relMap[key][0].name;                
                    for (let i = 0; i < relMap[key].length; i++) {
                        relarr.push(relMap[key][i].value);
                    }
                    formRels.push({ name: name, metarelid: key, bizrelbizobjs: relarr});
                }
            }
        }
        
        // tslint:disable-next-line:no-console
        console.log(`Your init rels:\n\n${JSON.stringify(formRels, null, 2)}`);
        return {
            bizRelations: formRels,
        };

    },
    handleSubmit: (values: RelationsFormValues, { props, setSubmitting }) => {   // async?  Se fullstack-graphql-airbnb-clone/packages/web/src/modules/register/ui/RegisterView.tsx
        setSubmitting(false);
        props.onSubmit(values);
    },
    displayName: 'Roberts BO Edit Form',
});

const InnerForm: React.SFC<BOEditFormProps & FormikProps<RelationsFormValues>> = (props) => (
    // <form onSubmit={props.handleSubmit}>
    <Form>
        <FieldArray
            name="bizRelations"
            render={() => (
                <div>
                    {props.metaObject.MetaObject.outgoingRelations.length > 0 ?
                        <Paper zDepth={0}>
                            {props.metaObject.MetaObject.outgoingRelations.map((rel, index) => (
                                <Paper zDepth={0} key={index}>
                                    {rel.multiplicity === 'One' ? 
                                        <Field
                                            name={`bizRelations.${index}.bizrelbizobjs`}
                                            component={MDSelectField}
                                            options={rel.oppositeObject.businessObjects}
                                            label={rel.oppositeName}
                                        />
                                        :
                                        <Field
                                            name={`bizRelations.${index}.bizrelbizobjs`}
                                            component={MDMultiSelectField}
                                            options={rel.oppositeObject.businessObjects}
                                            label={rel.oppositeName}
                                        />                                    }
                                </Paper>
                            ))}
                        </Paper>
                        :
                        <div>- No relation! -</div>
                    }
                </div>
            )}
        />
        <Button type="submit" primary={true} raised={true}>Save</Button>
    </Form>
);

export const BOEditRelationsForm = formikEnhancer(InnerForm);
