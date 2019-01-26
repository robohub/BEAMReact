import * as React from 'react';
// import { Field, reduxForm, InjectedFormProps, WrappedFieldProps, GenericField, /*GenericFieldArray, FormSection*/ } from 'redux-form';
import { BOEditType , MOResponse } from './../Types';

import { Paper, Button, /* SelectField, TextField, */ } from 'react-md';
import MDInputField from '../../../shared/MDInputField';
import MDSelectField from '../../../shared/MDSelectField';

import { withFormik, FormikProps, Field, FieldArray, Form } from 'formik';

interface FormAttributes {
    name: string;
    maid: string;
    bizattrval: string;
}

interface FormRelations {
    name: string;
    bizrelid: string;
    bizrelbizobjs: string | string[];
}

export interface FormValues {
    bizAttributes: FormAttributes[];
    bizRelations: FormRelations[]; 
}

interface BOEditFormProps {
    newObject: boolean;
    metaObject: MOResponse;
    bizObject?: BOEditType;
    onSubmit: (values: FormValues) => void;
}

const formikEnhancer = withFormik<BOEditFormProps, FormValues>({
    mapPropsToValues: props => {
        const { attributes: metaAttrs, outgoingRelations: metaRels } = props.metaObject.MetaObject;
        var formAttrs = new Array<FormAttributes>(0);
        var formRels = new Array<FormRelations>(0);
        
        if (props.newObject) {
            metaAttrs.map(ma => {
                formAttrs.push({ maid: ma.id, bizattrval: '', name: ma.name});
            });
            metaRels.map(mr => {
//                let value = (mr.multiplicity === 'Many') ? [] : '';
                let value: string | string[] = '';
                if (mr.multiplicity === 'Many') {
                    value = 'Many relation - not implemented!!';
                }
                formRels.push({ name: mr.oppositeName, bizrelid: mr.id, bizrelbizobjs: value});
            });
        } else {
            // tslint:disable-next-line:no-console
            console.log(`Editing:\n-----------------\n${props.bizObject.name}: ${props.bizObject.metaObject.name}`);
            const { bizAttributes, outgoingRelations } = props.bizObject;
            
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

            // Relations
            // -------- var bizrelIdMappings = new Array<BizRelMetaMapType>(0);
            var relMap = new Map<string, { Value: string | string[] }>();
            
            metaRels.map(mr => {
                let found = false;
                for (let i = 0; i < outgoingRelations.length; i++) {
                    if (mr.id === outgoingRelations[i].metaRelation.id) {
                        found = true;
                        let value = outgoingRelations[i].oppositeObject.id;
                        // -------- bizrelIdMappings.push({bizkey: outgoingRelations[i].id, metaRelationId: mr.id, oppositeObjectId: value});
                        if (mr.multiplicity === 'Many') {
                            if (relMap[mr.id] === undefined) {
                                relMap[mr.id] = [value];
                            } else {
                                relMap[mr.id].push(value);
                            }
                        } else {
                            formRels.push({ name: mr.oppositeName, bizrelid: mr.id, bizrelbizobjs: value});
                            break;
                        }
                    }
                }
                if (!found) {  // Metarelation has no outgoing relations for the business object, add empty string
                    formRels.push({ name: mr.oppositeName, bizrelid: mr.id, bizrelbizobjs: ''});
                }
            });
            /*
            // Fix rels with 'many' relations, map -> array
            for (var key in relMap) {
                if (relMap[key] !== undefined) {  // TSLint requires this! Read on StackOverflow
                    var relarr = [];                
                    for (let i = 0; i < relMap[key].length; i++) {
                        relarr.push(relMap[key][i]);
                    }
                    formRels[key] = { Value: relarr};
                }
            }
            */
        }
        
        // tslint:disable-next-line:no-console
        console.log(`Your init attrs:\n\n${JSON.stringify(formAttrs, null, 2)}`);
        // tslint:disable-next-line:no-console
        console.log(`Your init rels:\n\n${JSON.stringify(formRels, null, 2)}`);
        return {
            bizAttributes: formAttrs,
            bizRelations: formRels,
        };

    },
    handleSubmit: (values: FormValues, { props, setSubmitting }) => {   // async?  Se fullstack-graphql-airbnb-clone/packages/web/src/modules/register/ui/RegisterView.tsx
        setSubmitting(false);
        props.onSubmit(values);
    },
    displayName: 'Roberts BO Edit Form',
});

const InnerForm: React.SFC<BOEditFormProps & FormikProps<FormValues>> = (props) => (
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
        <FieldArray
            name="bizRelations"
            render={() => (
                <div>
                    {props.metaObject.MetaObject.outgoingRelations.length > 0 ?
                        <Paper zDepth={0}>
                            {props.metaObject.MetaObject.outgoingRelations.map((rel, index) => (
                                <Paper zDepth={0} key={index}>
                                    <Field
                                        name={`bizRelations.${index}.bizrelbizobjs`}
                                        component={MDSelectField}
                                        options={rel.oppositeObject.businessObjects}
                                        label={rel.oppositeName}
                                    />
                                </Paper>
                            ))}
                        </Paper>
                        :
                        <div>- No relation! -</div>
                    }
                </div>
            )}
        />

{/*        {props.metaObject.MetaObject.outgoingRelations.length > 0 ?
            <Paper zDepth={0}>
                {props.metaObject.MetaObject.outgoingRelations.map((rel, index) => (
                    <Paper zDepth={0} key={index}>
                        <XFieldDropdown
                            name={'bizRelations.' + rel.id + '.Value'}
                            component={BODropdownFormField}
                            multiple={rel.multiplicity === 'Many'}
                            options={rel.oppositeObject.businessObjects}
                            label={rel.oppositeName}
                        />
                      <MySelect
                        value={values.topics}
                        onChange={setFieldValue}
                        onBlur={setFieldTouched}
                        error={errors.topics}
                        touched={touched.topics}
                      />
                    </Paper>
                ))}
            </Paper>
            :
            <div>- No relations! -</div>
        }
*/}
        <Button type="submit" primary={true} raised={true}>Save</Button>
    </Form>
);

export const BOEditForm = formikEnhancer(InnerForm);

/*
interface BODropDownProps {
    label: string;
    options: {
        id: string;
        name: string
    }[];
}
const XFieldDropdown = Field as new () => GenericField<BODropDownProps & React.SelectHTMLAttributes<HTMLSelectElement>>;

const BODropdownFormField = (field: (React.SelectHTMLAttributes<HTMLSelectElement> & WrappedFieldProps & BODropDownProps)) => {
    var dropList = new Array<DropType>(0);
    field.options.map((o, index) => {
        dropList.push({label: o.name, value: o.id});
    });
    return (
        <SelectField
            id="moSelect"
            label={field.label}
            value={field.input.value}
            placeholder="Select Type"
            menuItems={dropList}
            onChange={(value, index, event) => field.input.onChange(value)}
            fullWidth={true}
            // position={SelectField.Positions.BOTTOM_RIGHT}
        />
    );
};
*/
