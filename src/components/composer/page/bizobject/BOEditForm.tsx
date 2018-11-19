import * as React from 'react';
// import { Field, reduxForm, InjectedFormProps, WrappedFieldProps, GenericField, /*GenericFieldArray, FormSection*/ } from 'redux-form';
import { BOEditType , MOResponse } from './../Types';

import { SelectField, Paper, TextField, Button } from 'react-md';

import { withFormik, FormikProps } from 'formik';

interface DropType {
    label: string;
    value: string;
}
/*
export interface BOEditFormData {
    // tslint:disable-next-line:no-any
    bizAttributes: any;
    // tslint:disable-next-line:no-any
    bizRelations: any;
}
*/
interface FormAttributes {
    bizattrid: string;
    bizattrval: string;
}

interface FormRelations {
    bizrelid: string;
    bizrelbizobjs: string | string[];
}

export interface BOEditFormData {
    bizAttributes: formAttributes[];
    bizRelations: formRelations[]; 
}

interface BOEditFormProps {
    newObject: boolean;
    metaObject: MOResponse;
    bizObject?: BOEditType;
    onSubmit: (values: BOEditFormData) => void;
    // initialValues: BOEditFormData;
}
/*
type BOEditFormInjectedProps = InjectedFormProps<BOEditFormData, BOEditFormProps>;

export default 
reduxForm<BOEditFormData, BOEditFormProps>({
    form: 'BOEditForm', // TODO: sätt namn för varje BO vid runtime --> unik för varje BO i global Store!?
})(
class BOEditForm extends React.Component<BOEditFormInjectedProps & BOEditFormProps> {
    render() {
        const { MetaObject } = this.props.metaObject;
        return (
            <form onSubmit={this.props.handleSubmit}>
                {MetaObject.attributes.length > 0 ?
                    <Paper zDepth={0}>
                        {MetaObject.attributes.map((attr, index) => (
                            <Paper zDepth={0} key={index}>
                                <XTextField
                                    name={'bizAttributes.' + attr.id + '.Value'}
                                    component={renderTextField}
                                    label={attr.name}
                                />
                            </Paper>
                        ))}
                    </Paper>
                    :
                    <div>- No attributes! -</div>
                }
                {MetaObject.outgoingRelations.length > 0 ?
                    <Paper zDepth={0}>
                        {MetaObject.outgoingRelations.map((rel, index) => (
                            <Paper zDepth={0} key={index}>
                                <XFieldDropdown
                                    name={'bizRelations.' + rel.id + '.Value'}
                                    component={BODropdownFormField}
                                    multiple={rel.multiplicity === 'Many'}
                                    options={rel.oppositeObject.businessObjects}
                                    label={rel.oppositeName}
                                />
                            </Paper>
                        ))}
                    </Paper>
                    :
                    <div>- No relations! -</div>
                }
                <Button type="submit" primary={true} raised={true}>Save</Button>
            </form>
        );
    }
});
*/

const formikEnhancer = withFormik<BOEditFormProps, BOEditFormData>({
    mapPropsToValues: props => ({
        // bizAttributes: props.initialValues.bizAttributes,
        // bizRelations: props.initialValues.bizRelations,
    
        const { attributes: metaAttrs, outgoingRelations: metaRels } = props.metaobject.MetaObject;
        var formAttrs = new Array<FormAttributes>(0);
        var formRels = new Array<FormRelations>(0);
        
        if (newObject) {

            metaAttrs.map((ma => {
                formAttrs.push({ bizattrid: ma.id, bizattrval: ''});
            });
            metaRels.map((mr => {
                let value = (mr.multiplicity === 'Many') ? [] : '';
//                let value: string | string[] = '';
//                if (mr.multiplicity === 'Many') {
//                    value = [];
//                }
                formRels.push({ bizrelid: mr.id, bizrelobjs: value});
            });
            
        } else {
            const { bizAttributes, outgoingRelations } = this.props.bizObject;
            
            // Attributes
            metaAttrs.map(ma => {
                let value: string = '';
                for (let i = 0; i < bizAttributes.length; i++) {
                    if (ma.id === bizAttributes[i].metaAttribute.id) {
                        value = bizAttributes[i].value;
                        break;
                    }
                }
                formAttrs[ma.id] = { Value: value };
            });

            // Relations
            this.bizrelIdMappings = new Array<BizRelMetaMapType>(0);
            var relMap = new Map<string, { Value: string | string[] }>();
            
            metaRels.map(mr => {
                let found = false;
                for (let i = 0; i < outgoingRelations.length; i++) {
                    if (mr.id === outgoingRelations[i].metaRelation.id) {
                        found = true;
                        let value = outgoingRelations[i].oppositeObject.id;
                        this.bizrelIdMappings.push({bizkey: outgoingRelations[i].id, metaRelationId: mr.id, oppositeObjectId: value});
                        if (mr.multiplicity === 'Many') {
                            if (relMap[mr.id] === undefined) {
                                relMap[mr.id] = [value];
                            } else {
                                relMap[mr.id].push(value);
                            }
                        } else {
                            formRels[mr.id] = { Value: value };                    
                            break;
                        }
                    }
                }
                if (!found) {  // Metarelation has no outgoing relations for the business object, add []
                    formRels[mr.id] = { Value: [] };                    
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
        console.log(`Your init:\n\n${JSON.stringify(this.formInit, null, 2)}`);

    }),
    handleSubmit: (values: BOEditFormData, { props, setSubmitting }) => {
        setSubmitting(false);
        props.onSubmit(values);
    },
    displayName: 'Roberts BO Edit Form',
});

const InnerForm : React.SFC<BOEditFormData & FormikProps<BOEditFormProps>> = (props) => (
    <form onSubmit={props.handleSubmit}>
        {props.metaObject.MetaObject.attributes.length > 0 ?
            <Paper zDepth={0}>
                {props.metaObject.MetaObject.attributes.map((attr, index) => (
                    <Paper zDepth={0} key={index}>
                        <XTextField
                            name={'bizAttributes.' + attr.id + '.Value'}
                            component={renderTextField}
                            label={attr.name}
                        />
                    </Paper>
                ))}
            </Paper>
            :
            <div>- No attributes! -</div>
        }
        {props.metaObject.MetaObject.outgoingRelations.length > 0 ?
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
        <Button type="submit" primary={true} raised={true}>Save</Button>
    </form>
);

const BOEditForm = formikEnhancer(InnerForm);
export default BOEditForm;

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


interface MySelectProps {
  value: Array<DropType>;
  onChange: Function;
  onBlur: Function;
  error: string;
  touched: boolean;
}

class MySelect extends React.Component<MySelectProps, any> {
  handleChange = (value: Array<string>) => {
    // this is going to call setFieldValue and manually update values.topcis
    this.props.onChange('topics', value);
  };

  handleBlur = () => {
    // this is going to call setFieldTouched and manually update touched.topcis
    this.props.onBlur('topics', true);
  };

  render() {
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
        <Select
          id="color"
          options={options}
          multi={true}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          value={this.props.value}
        />
    );
  }
}

interface TextFieldProps {
    label: string;
}

const XTextField = Field as new () => GenericField<TextFieldProps & React.InputHTMLAttributes<HTMLInputElement>>;

const renderTextField = (field: (React.InputHTMLAttributes<HTMLInputElement> & WrappedFieldProps & TextFieldProps)) => {
    return (
        <TextField
            id="boEdit"
            label={field.label}
            placeholder={field.label}
            {...field.input}
            // errorText={touched && error}
        />
    );
};
/*

            // Code snippet for custom FieldArrays...
            <Form onSubmit={this.props.handleSubmit}>
                    {MetaObject.attributes.length > 0 ?
                        <FieldArrayAttrs name="attributes" component={RenderAttributes} attrs={MetaObject.attributes}/>
                        :
                        <div>- No attributes! -</div>
                    }
                    {MetaObject.outgoingRelations.length > 0 ?
                        <FieldArrayRelations name="relations" component={RenderRelations} rels={MetaObject.outgoingRelations}/>
                        :
                        <div>- No relations! -</div>
                    }
                <Form.Button>Save</Form.Button>
            </Form>

interface BORelsProps {
    rels: {
        id: string;
        oppositeName: string;
        oppositeObject: {
            name: string;
            businessObjects: {
                id: string;
                name: string
            }[]
        }
        multiplicity: string
    }[];
}

interface BOFormFieldValue {   // TODO: hur relaterar detta med formData?
    vaxlue: string;
}
interface BOAttrsProps {
    attrs: {
        id: string;
        name: string;
    }[];
}

const FieldArrayAttrs = FieldArray as new () => GenericFieldArray<BOFormFieldValue, BOAttrsProps>;
type FieldArrayAttrsCompProps = BOAttrsProps & WrappedFieldArrayProps<BOFormFieldValue>;

const FieldArrayRelations = FieldArray as new () => GenericFieldArray<BOFormFieldValue, BORelsProps>;
type FieldArrayRelsCompProps = BORelsProps & WrappedFieldArrayProps<BOFormFieldValue>;

class RenderAttributes extends React.Component<FieldArrayAttrsCompProps> {
    render() {
        const { attrs } = this.props;
        return (
            <Segment.Group>
                {attrs.map((attr, index) => (
                    <Segment key={index}>
                        <Form.Field>
                            <label>{attr.name}</label>
                            <Field
                                // name={attr.id}
                                name={'Attributes[' + index + '].Value'}
                                type="text"
                                component="input"
                            />
                        </Form.Field>
                    </Segment>
                ))}
            </Segment.Group>
        );
    }
}

const RenderRelations: React.StatelessComponent<FieldArrayRelsCompProps> = ({ fields, rels }) => {
    return (
        <Segment.Group>
            {rels.map((rel, index) => (
                <Segment key={index}>
                    <Form.Field key={rel.id} >
                        <label>{rel.oppositeName}</label>
                        <XFieldDropdown
                            // name={rel.id}
                            name={'Relations[' + index + '].test.Value'}
                            component={BODropdownFormField}
                            multiple={rel.multiplicity === 'Many'}
                            options={rel.oppositeObject.businessObjects}
                        />
                    </Form.Field>
                </Segment>
            ))}
        </Segment.Group>
    );
};
*/
