import * as React from 'react';

import { Tabs, Tab, Button } from '@material-ui/core';

import AttachementIcon from '@material-ui/icons/AttachFile';
import LinkIcon from '@material-ui/icons/Link';

import { BOEditType , MOResponse } from './Types';

import { withFormik, Form, FieldArray, FormikProps, Field } from 'formik';
import MDInputField from '../../../shared/MDInputField';
import MDSelectField from '../../../shared/MDSelectField';
import MDMultiSelectField from '../../../shared/MDMultiSelectField';
import { FormValues, FormAttribute, FormRelation } from './Types';

interface Props {
    newObject: boolean;
    metaObject: MOResponse;
    bizObject?: BOEditType;
    onSubmit: (values: FormValues) => void;
}

interface CompState {
    tabval: number;
}

const formikEnhancer = withFormik<Props, FormValues>({
    mapPropsToValues: props => {
        
        // Attributes

        const { attributes: metaAttrs } = props.metaObject.MetaObject;
        var formAttrs = new Array<FormAttribute>(0);
        
        if (props.newObject) {
            metaAttrs.map(ma => {
                formAttrs.push({ maid: ma.id, bizattrval: '', name: ma.name});
            });
        } else {
            // tslint:disable-next-line:no-console
            // console.log(`Editing:\n-----------------\n${props.bizObject.name}: ${props.bizObject.metaObject.name}`);
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

        // Relations

        const { outgoingRelations: metaRels } = props.metaObject.MetaObject;
        var formRels = new Array<FormRelation>(0);
        
        if (props.newObject) {
            metaRels.map(mr => {
                let value: string | string[] = '';
                if (mr.multiplicity === 'Many') {
                    value = [];
                }
                formRels.push({ name: mr.oppositeName, metarelid: mr.id, bizrelbizobjs: value});
            });
        } else {
            // tslint:disable-next-line:no-console
            // console.log(`Editing:\n-----------------\n${props.bizObject.name}: ${props.bizObject.metaObject.name}`);
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
                if (!found) {  // Metarelation has no outgoing relations for the business object, add empty string/array
                    if (mr.multiplicity === 'Many') {
                        formRels.push({ name: mr.oppositeName, metarelid: mr.id, bizrelbizobjs: []});
                    } else {
                        formRels.push({ name: mr.oppositeName, metarelid: mr.id, bizrelbizobjs: ''});
                    }
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
        // console.log(`Your init attrs:\n\n${JSON.stringify(formAttrs, null, 2)}`);

        return {
            bizAttributes: formAttrs,
            bizRelations: formRels
        };

    },
    handleSubmit: (values: FormValues, { props, setSubmitting }) => {   // async?  Se fullstack-graphql-airbnb-clone/packages/web/src/modules/register/ui/RegisterView.tsx
        setSubmitting(false);
        props.onSubmit(values);
    },
    displayName: 'Roberts BO Edit Form',
});

class InnerForm extends React.Component<Props & FormikProps<FormValues>, CompState> {

    constructor(props: Props & FormikProps<FormValues>) {
        super(props);
        this.state = { tabval: 0 };
    }

    handleTabChange = (e: React.ChangeEvent, value: number) => {
        this.setState( {tabval: value});
    }

    render() {
        return (
            <Form>
                <div>
                    <Tabs value={this.state.tabval} onChange={this.handleTabChange}>
                        <Tab label="Attributes" icon={<AttachementIcon />}/>
                        <Tab label="Relations" icon={<LinkIcon />}/>
                    </Tabs>
                    {this.state.tabval === 0 &&                     
                            <FieldArray
                                name="bizAttributes"
                                render={() => (
                                    <div>
                                        {this.props.values.bizAttributes.length > 0 ?
                                            <div>
                                                {this.props.values.bizAttributes.map((attr, index) => (
                                                    <div key={index}>
                                                        <Field
                                                            name={`bizAttributes.${index}.bizattrval`}
                                                            type="text"
                                                            component={MDInputField}
                                                            label={attr.name}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            :
                                            <div>- No attributes! -</div>
                                        }
                                    </div>
                                )}
                            />
                    }
                    {this.state.tabval === 1 &&
                            <FieldArray
                                name="bizRelations"
                                render={() => (
                                    <div>
                                        {this.props.metaObject.MetaObject.outgoingRelations.length > 0 ?
                                            <div>
                                                {this.props.metaObject.MetaObject.outgoingRelations.map((rel, index) => (
                                                    <div key={index}>
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
                                                            />
                                                        }
                                                    </div>
                                                ))}
                                            </div>
                                            :
                                            <div>- No relation! -</div>
                                        }
                                    </div>
                                )}
                            />
                    }
                </div>
                <Button variant="contained" color="primary" type="submit">Save</Button>
            </Form>
        );
    }
}

export const BOEditForm = formikEnhancer(InnerForm);
