import * as React from 'react';

import { Tabs, Tab, Button } from '@material-ui/core';

import AttachementIcon from '@material-ui/icons/AttachFile';
import LinkIcon from '@material-ui/icons/Link';

import { MOAttributeItemType, MOPropertiesType } from './Types';

import { withFormik, Form, FormikProps } from 'formik';

import EditMOAttributesForm from './forms/EditMOAttributesForm';
import EditMORelationsForm from './forms/EditMORelationsForm';
import { MOEditFormData } from './forms/Types';

type FormValues = MOEditFormData;

interface Props {
    metaObject: MOPropertiesType;
    metaAttributes: MOAttributeItemType[];
    metaObjects: MOPropertiesType[];
    onSubmit: (values: FormValues) => void;
}

interface CompState {
    tabval: number;
}

const formikEnhancer = withFormik<Props, FormValues>({
    mapPropsToValues: props => {
        // Attributes - nothing to do  RH TODO
        
        // Relations
/*
        const { outgoingRelations: metaRels } = props.metaObject;
        var formRels = new Array<MORelationItemType>(0);   // RH TODO Fix relations...
       
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
//            const { outgoingRelations } = props.bizObject;

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
*/

        // tslint:disable-next-line:no-console
        // console.log(`Your init attrs:\n\n${JSON.stringify(formAttrs, null, 2)}`);

        return {
            attributes: props.metaObject.attributes,
            relations: props.metaObject.outgoingRelations
        };

    },
    handleSubmit: (values: FormValues, { props, setSubmitting }) => {   // async?  Se fullstack-graphql-airbnb-clone/packages/web/src/modules/register/ui/RegisterView.tsx
        setSubmitting(false);
        props.onSubmit(values);
    },
    displayName: 'Roberts MO Edit Form',
});
/*
type Metarel = {
    multiplicity: string;
    bizobjects: {
        id: string;
        name: string;
    }[]
};
*/
class InnerForm extends React.Component<Props & FormikProps<FormValues>, CompState> {

    // private options = new Map<string, Metarel>();

    constructor(props: Props & FormikProps<FormValues>) {
        super(props);
        this.state = { tabval: 0 };
/*        props.metaObject.MetaObject.outgoingRelations.map(mr => {
            if (this.options[mr.id] === undefined) {
                this.options[mr.id] = { multiplicity: mr.multiplicity, bizobjects: mr.oppositeObject.businessObjects };
            }
        });
        // tslint:disable-next-line:no-console
        console.log('OPTIONS: ', this.options);*/
    }

    handleTabChange = (e: React.ChangeEvent, value: number) => {
        this.setState( {tabval: value});
    }

    render() {
        const props = this.props;
        return (
            <Form>
                <div>
                    <Tabs value={this.state.tabval} onChange={this.handleTabChange}>
                        <Tab label="Define Attributes" icon={<AttachementIcon />}/>
                        <Tab label="Define Relations" icon={<LinkIcon />}/>
                    </Tabs>
                    {this.state.tabval === 0 && 
                        <EditMOAttributesForm
                            values={props.values.attributes}
                            metaAttributes={props.metaAttributes}
                        />
                    }
                    {this.state.tabval === 1 && 
                        <EditMORelationsForm
                            values={props.values.relations}
                            metaObjects={props.metaObjects}
                        />
                    }
                            {/*<FieldArray
                                name="bizRelations"
                                render={() => (
                                    <div>
                                        {this.props.values.bizRelations.length > 0 ?
                                            <div>
                                                {this.props.values.bizRelations.map((rel, index) => (
                                                    <div key={index}>
                                                        {this.options[rel.metarelid].multiplicity === 'One' ? 
                                                            <Field
                                                                name={`bizRelations.${index}.bizrelbizobjs`}
                                                                component={MDSelectField}
                                                                options={this.options[rel.metarelid].bizobjects}
                                                                label={rel.name}
                                                            />
                                                            :
                                                            <Field
                                                                name={`bizRelations.${index}.bizrelbizobjs`}
                                                                component={MDMultiSelectField}
                                                                options={this.options[rel.metarelid].bizobjects}
                                                                label={rel.name}
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
                                    />*/}
                </div>
                <Button variant="contained" color="primary" type="submit">Save</Button>
            </Form>
        );
    }
}

export const MOEditForm = formikEnhancer(InnerForm);
