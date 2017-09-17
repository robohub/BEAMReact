import * as React from 'react';
import { graphql, gql, ChildProps } from 'react-apollo';
import { allBOQuery } from './queries';
import BOEditForm, { BOEditFormData } from './BOEditForm';
import { MOResponse, BizObjectsType, BOEditType } from './../Types';
// import * as BOTypes from './../Types';

const createBizObject = gql`
mutation CreateBO (
    $id: ID!, 
    $name: String!, 
    $attrs: [BusinessObjectbizAttributesBizAttribute!],
    $rels: [BusinessObjectoutgoingRelationsBizRelation!]    
) 
{
    createBusinessObject(
        metaObjectId: $id,
        name: $name,
        state: "Created",
        bizAttributes: $attrs,
        outgoingRelations: $rels
    )
    {
        id
        name
        state
        metaObject {
            name
        }
        bizAttributes {
            id
            metaAttribute
            {
                name
            }
            value
        }
        outgoingRelations {
            id
            oppositeObject {
                name
            }
            metaRelation {
                multiplicity
                oppositeName
            }
        }
    }
}
`;

type InputProps = {
    // metaID: string;
    newObject: boolean;
    metaobject: MOResponse;
    bizObject?: BOEditType;    
};

class EditBOView extends React.Component<ChildProps<InputProps, MOResponse>> {

    fromBOToForm = (newObject: boolean) => {
        
        const { attributes: metaAttrs, outgoingRelations: metaRels } = this.props.metaobject.MetaObject;
        var formAttrs = new Array<{'key': string, 'Value': string}>(0);
        type RelType = {'key': string, 'Value': string | string[] };
        var formRels = new Array<RelType>(0); 
        
        if (newObject) {

            metaAttrs.map(ma => {
                var attr = {'key': ma.id, 'Value': ''};
                formAttrs.push(attr);
            });
            metaRels.map(mr => {
                var rel: RelType = {'key': mr.id, 'Value': ''};
                if (mr.multiplicity === 'Many') {
                    rel = {'key': mr.id, 'Value': []};
                }
                formRels.push(rel);
            });

        } else {
            const { bizAttributes, outgoingRelations } = this.props.bizObject;
            
            // Attributes
            // TODO: är det overkill med MetaAttributes-loop? Se till att alla MetaAttributes sparas vid skapande av BizObject?
            // Om man lägger till ett attribut i meta-modellen --> existerande BO saknar attributet --> korrupt DB?
            // Nej - inte om man kollar vid sparning??? Nu: skickar in hela strukturen till formen, vilket är bra!
            metaAttrs.map(ma => {
                var attr = {'key': ma.id, 'Value': ''};
                for (let i = 0; i < bizAttributes.length; i++) {
                    if (ma.id === bizAttributes[i].metaAttribute.id) {
                        attr.Value = bizAttributes[i].value;
                        break;
                    }
                }
                formAttrs.push(attr);
            });

            // Relations
            var relMap = new Map<string, string>();

            metaRels.map(mr => {
                var rel = {'key': mr.id, 'Value': ''};
                for (let i = 0; i < outgoingRelations.length; i++) {
                    if (mr.id === outgoingRelations[i].metaRelation.id) {
                        if (outgoingRelations[i].metaRelation.multiplicity === 'Many') {
                            if (relMap[mr.id] === undefined) {
                                relMap[mr.id] = [outgoingRelations[i].oppositeObject.id];
                            } else {
                                relMap[mr.id].push(outgoingRelations[i].oppositeObject.id);
                            }
                        } else {
                            rel.Value = outgoingRelations[i].oppositeObject.id;
                            formRels.push(rel);
                            break;
                        }
                    }
                }
            });

            // Fix rels with 'many' relations, map -> array
            var relarr = new Array<string>(0);
            
            for (var key in relMap) {
                if (relMap[key] !== undefined) {  // TSLint requires this! Read on StackOverflow
                    relarr = [];                
                    for (let i = 0; i < relMap[key].length; i++) {
                        relarr.push(relMap[key][i]);
                    }
                    formRels.push({'key': key, 'Value': relarr}); 
                }
            }
        }
        const formInit = {
            'Attributes': formAttrs,
            'Relations': formRels,
        };
        return formInit;
    }

    onSave = async (values: BOEditFormData) => {

        try {
            
            // TODO: lägg till UpdateObject!!! Inte bara create
            // Create funkar vid nytt objekt, uppdaterade värden, men inte t.ex. när relationer tas bor --> ta bor BizRelations!!!

            const { Attributes, Relations } = values;
            var attrs = new Array<{metaAttributeId: string, value: string}>(0);
            for (let i = 0; i < Attributes.length; i++) {
                attrs.push({metaAttributeId: Attributes[i].key, value: Attributes[i].Value});
            }
            var rels = new Array<{metaRelationId: string, oppositeObjectId: string}>(0);
            for (let i = 0; i < Relations.length; i++) {
                if (Relations[i].Value !== null && Array.isArray(Relations[i].Value)) { // from {rel, [objid]} -> [{rel, objid}]
                    for (let e = 0; e < Relations[i].Value.length; e++) {
                        rels.push({metaRelationId: Relations[i].key, oppositeObjectId: Relations[i].Value[e]});
                    }
                } else {
                    rels.push({metaRelationId: Relations[i].key, oppositeObjectId: Relations[i].Value as string});
                }
            }

            const { mutate } = this.props;
            await mutate({
                variables: {
                    id: this.props.metaobject.MetaObject.id, 
                    name: 'TEST for removal', 
                    attrs: attrs,
                    state: 'Created',
                    rels: rels
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
        } catch (e) {
            alert('error: ' + e);
        }
    }

    showResults = (values: BOEditFormData) => {
        // tslint:disable-next-line:no-console
        console.log(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
        window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
    }

    render() {
        return (
            this.props.newObject ?
            (
                <BOEditForm
                    newObject={true}
                    onSubmit={this.showResults}
                    metaObject={this.props.metaobject}
                    bizObject={null}
                    initialValues={this.fromBOToForm(true)}

                />
            )
            :
            (
                <BOEditForm
                    newObject={false}
                    onSubmit={this.showResults}
                    metaObject={this.props.metaobject}
                    bizObject={this.props.bizObject}
                    initialValues={this.fromBOToForm(false)
                        /*{
                            'Attributes': [
                                {
                                'key': '1',
                                'Value': 'hejsan'
                                },
                                {
                                'key': '2',
                                'Value': 'PER'
                                },
                                {
                                'key': '3',
                                'Value': 'sssssssCC'
                                }
                            ],
                                'Relations': [
                                    { 
                                        'key': '4',
                                        'Value': 'cj6289xve0m2h0166ykq6666g',
                                    },
                                    {
                                        'key': '5',
                                        'Value': [
                                        'cj6wgh0zpafpk015003fphrw4',
                                        'cj6vycflqa21m0150g5r7oi67'
                                        ]
                                    },
                                    {
                                        'key': '6',
                                        'Value': [
                                        'cj721890u0u780193k6ehychc',
                                        'cj74cqvptywlt016238eu6ip0'
                                        ]
                                    }
                                ]
                        }*/
                        }
                /> 
            )               
        );
    }
}

export default graphql<MOResponse, InputProps>(createBizObject)(EditBOView);