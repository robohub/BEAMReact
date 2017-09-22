import * as React from 'react';
import { graphql, gql, ChildProps, compose, MutationFunc } from 'react-apollo';
import { allBOQuery } from './queries';
import BOEditForm, { BOEditFormData } from './BOEditForm';
import { MOResponse, BizObjectsType, BOEditType } from './../Types';
// import * as diff from 'deep-diff';

const createBizObject = gql`
mutation CreateBO (
    $id: ID!, 
    $name: String!, 
    $state: String!,
    $attrs: [BusinessObjectbizAttributesBizAttribute!],
    $rels: [BusinessObjectoutgoingRelationsBizRelation!]    
) 
{
    createBusinessObject(
        metaObjectId: $id,
        name: $name,
        state: $state,
        bizAttributes: $attrs,
        outgoingRelations: $rels
    )
    {
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
        outgoingRelations {
            id
            oppositeObject {
                id
                name
            }
            metaRelation {
                id
                multiplicity
                oppositeName
            }
        }
    }
}
`;

const deleteBizRel = gql`
mutation removeBR($bizRelId: ID!)  {
    deleteBizRelation(id: $bizRelId )
    {id}
}
`;

type RelType = { metaRelationId: string, Value: string | string[]};
type AttrType = {key: string, Value: string };
type FormRelPair = { metaRelationId: string, oppositeObjectId: string };

type BizMetaMapType = { bizkey: string, metaRelationId: string, oppositeObjectId: string};

class EditBOView extends React.Component<ChildProps<MyProps & MyMutations, {}>> {

    private formInit: BOEditFormData;
    private bizrelIdMappings: Array<BizMetaMapType>;  // Use this to find bizRelation-id for deleted <metaRelationId,Value>

    fromBOToForm = (newObject: boolean) => {
        
        const { attributes: metaAttrs, outgoingRelations: metaRels } = this.props.metaobject.MetaObject;
        var formAttrs = new Array<AttrType>(0);
        var formRels = new Array<RelType>(0); 
        
        if (newObject) {

            metaAttrs.map(ma => {
                var attr = {key: ma.id, Value: ''};
                formAttrs.push(attr);
            });
            metaRels.map(mr => {
                var rel: RelType = { metaRelationId: mr.id, Value: ''};
                if (mr.multiplicity === 'Many') {
                    rel = { metaRelationId: mr.id, Value: []};
                }
                formRels.push(rel);
            });

        } else {
            const { bizAttributes, outgoingRelations } = this.props.bizObject;
            
            // Attributes
            metaAttrs.map(ma => {
                var attr = {key: ma.id, Value: ''};
                for (let i = 0; i < bizAttributes.length; i++) {
                    if (ma.id === bizAttributes[i].metaAttribute.id) {
                        attr.Value = bizAttributes[i].value;
                        break;
                    }
                }
                formAttrs.push(attr);
            });

            // Relations
            this.bizrelIdMappings = new Array<BizMetaMapType>(0);
            var relMap = new Map<string, { Value: string | string[] }>();
            let undordedRels = new Array<RelType>(0);
            
            metaRels.map(mr => {
                var rel = {metaRelationId: mr.id, Value: ''};
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
                            rel.Value = value;
                            undordedRels.push(rel);
                            break;
                        }
                    }
                }
                if (!found) {  // Metarelation has no outgoing relations for the business object, add []
                    undordedRels.push({metaRelationId: mr.id, Value: []});
                }
            });

            // Fix rels with 'many' relations, map -> array
            for (var key in relMap) {
                if (relMap[key] !== undefined) {  // TSLint requires this! Read on StackOverflow
                    var relarr = [];                
                    for (let i = 0; i < relMap[key].length; i++) {
                        relarr.push(relMap[key][i]);
                    }
                    undordedRels.push({metaRelationId: key, Value: relarr});
                }
            }
            // Fix to corresponding order in BOEditForm
            metaRels.map(mr => {
                for (let i = 0; i < undordedRels.length; i++) {
                    if (mr.id === undordedRels[i].metaRelationId) {
                        formRels.push(undordedRels[i]);
                        break;
                    }
                }
            }); 
        }
        this.formInit = {
            Attributes: formAttrs,
            Relations: formRels
        };
        // tslint:disable-next-line:no-console
        console.log(`Your init:\n\n${JSON.stringify(this.formInit, null, 2)}`);
                
        return this.formInit;
    }

    deleteBizRels = async (bizrels: string[]) => {
        try {
            for (let i = 0; i < bizrels.length; i++) {
                await this.props.deleteBR({
                    variables: {
                        bizRelId: bizrels[i], 
                    },
                });
            }
            
            // TODO: Loop through bizrels and delete from BizRelations from Store!

        } catch (err) {
            alert('Error when deleting business relations...\n' + err);
        }
    }

    onSave = async (values: BOEditFormData) => {
        try {
            if (this.props.newObject) {
                // Fix attributes for save
                const { Attributes, Relations } = values;
                var attrs = new Array<{metaAttributeId: string, value: string}>(0);
                for (let i = 0; i < Attributes.length; i++) {
                    attrs.push({metaAttributeId: Attributes[i].key, value: Attributes[i].Value});
                }
                var rels = this.relArrayToPairs(Relations);
                
                // Fix relations for save
                // const { mutate } = this.props;
                await this.props.createBO({
                    variables: {
                        id: this.props.metaobject.MetaObject.id, 
                        name: 'TEST for removal', 
                        attrs: attrs,
                        state: 'Created',
                        rels: rels
                    },
                    update: (store, { data: { createBusinessObject /* same name as graphql operation name!!! */} }) => {
                        // Read the data from the cache for this query.
                        const data: BizObjectsType = store.readQuery({query: allBOQuery });
                        // Add our channel from the mutation to the beginning.
                        data.allBusinessObjects.splice(0, 0, createBusinessObject);
                        // Write the data back to the cache.
                        store.writeQuery({ query: allBOQuery, data });
                    },
                });
            } else {
                // Check if relations added/deleted
                var valuesRels = this.relArrayToPairs(values.Relations);
                var inputRels = this.relArrayToPairs(this.formInit.Relations);
                var deleted = this.diffDeleted(inputRels, valuesRels);
                var added = this.diffDeleted(valuesRels, inputRels);
                
                let deleteBizRels = new Array<string>(0);
                deleted.forEach(element => {
                    for (let i = 0; i < this.bizrelIdMappings.length; i++) {
                        if (
                            element.metaRelationId === this.bizrelIdMappings[i].metaRelationId && 
                            element.oppositeObjectId === this.bizrelIdMappings[i].oppositeObjectId) {
                                deleteBizRels.push(this.bizrelIdMappings[i].bizkey);
                        }
                    }
                });
                await this.deleteBizRels(deleteBizRels);

                alert('Check debug console!');
                // tslint:disable-next-line:no-console
                console.log(`OLD :\n${JSON.stringify(inputRels, null, 2)}`);      
                // tslint:disable-next-line:no-console
                console.log(`NEW :\n${JSON.stringify(valuesRels, null, 2)}`);      

                // tslint:disable-next-line:no-console
                console.log('Rob deleted ' + JSON.stringify(deleted) + '\n' + 'Rob added: ' + JSON.stringify(added));

                // tslint:disable-next-line:no-console
                console.log('Mapping array: ' + JSON.stringify(this.bizrelIdMappings));
                // tslint:disable-next-line:no-console
                console.log('Bizrelids to be deleted!! ' + JSON.stringify(deleteBizRels));
                /*                
                await this.props.deleteBR({
                    variables: {
                        bizRelId: deleteBizRels[0], 
                    },
                    update: (store, { data: { createBusinessObject } }) => {
                        // Read the data from the cache for this query.
                        const data: BizObjectsType = store.readQuery({query: allBOQuery });
                        // Add our channel from the mutation to the beginning.
                        data.allBusinessObjects.splice(0, 0, createBusinessObject);
                        // Write the data back to the cache.
                        store.writeQuery({ query: allBOQuery, data });
                    },
                });
*/
            }
        } catch (e) {
            alert('ONSAVE error: ' + e);
        }
    }

    // from {metarelId, [objid]} -> [metarelId, objid}]
    relArrayToPairs = (relArray: RelType[]): Array<FormRelPair> => {
        var relPairs = new Array<FormRelPair>(0);
        for (let i = 0; i < relArray.length; i++) {
            if (relArray[i].Value !== null && Array.isArray(relArray[i].Value)) {
                for (let e = 0; e < relArray[i].Value.length; e++) {
                    relPairs.push({metaRelationId: relArray[i].metaRelationId, oppositeObjectId: relArray[i].Value[e]});
                }
            } else {
                relPairs.push({metaRelationId: relArray[i].metaRelationId , oppositeObjectId: relArray[i].Value as string});
            }
        }
        return relPairs;
    }

    diffDeleted = (source: Array<FormRelPair>, compare: Array<FormRelPair>): Array<FormRelPair> => {
        var deleted = new Array<FormRelPair>(0);
        source.forEach(el => {
            if (compare.findIndex(element => {return JSON.stringify(element) === JSON.stringify(el); }) === -1) {
                deleted.push(el);
            }
        });
        return deleted;
    }

    showResults = (values: BOEditFormData) => {
        // tslint:disable-next-line:no-console
        console.log(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
        window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
    }

    render() {
        return (
            <BOEditForm
                newObject={this.props.newObject}
                onSubmit={this.onSave}
                metaObject={this.props.metaobject}
                bizObject={this.props.newObject ? null : this.props.bizObject}
                initialValues={this.fromBOToForm(this.props.newObject)}
            />
        );
    }
}
/*
interface MyResults {
    bo: BizObjectsType;
  }
*/
type MyProps = {
    newObject: boolean;
    metaobject: MOResponse;
    bizObject?: BOEditType; 
};
interface MyMutations {
    deleteBR: MutationFunc<{ id: string; }>;
    createBO: MutationFunc<BizObjectsType>;
}

// type MyPropsType = ChildProps<MyProps & MyMutations, MOResponse>;

// export default graphql<{}, MyProps>(createBizObject, { name: 'createBO'})(EditBOView);
export default compose(
    graphql<{}, MyProps>(deleteBizRel, { name: 'deleteBR' }),
    graphql<{}, MyProps>(createBizObject, { name: 'createBO'}),    
)(EditBOView);
