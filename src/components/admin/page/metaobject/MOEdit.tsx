import * as React from 'react';
// import { List } from 'semantic-ui-react';
import { MOEditType } from './Types';
import MOListAttributes from './MOListAttributes';
import MOListRelations from './MOListRelations';
import { Segment, Menu, Input, Button, Label } from 'semantic-ui-react';
import EditAttributesModal from '../modals/attributeModal';

export default function MOEdit ({ allMetaObjects }: MOEditType) {

    return (
            <Segment.Group>
                <Segment>
                    <Input icon="plus" iconPosition="left" placeholder="Add metaobject"/>
                    {' '}
                    <Button disabled={true} >Add</Button>
                </Segment>
                <Segment>
                    {allMetaObjects.map(obj =>
                        <Segment key={obj.name} >
                            <Segment >
                                <Menu secondary={true} size="small">
                                    <Menu.Header><Label ribbon={true} size="big">{obj.name}</Label></Menu.Header>
                                    <Menu.Item position="right">
                                        <Input icon="search" placeholder="Search..." />
                                    </Menu.Item>
                                    <EditAttributesModal/>
                                    <Button size="small">+ Relation</Button>
                                    <Button circular={true} icon="setting"/>
                                </Menu>        
                            </Segment>
                            { obj.attributes.length === 0 ?
                                <Segment>No attributes</Segment>
                                :
                                <MOListAttributes name={obj.name} attributes={obj.attributes} />
                            }
                            { obj.outgoingRelations.length === 0 ?
                                <Segment>No relations</Segment>
                                :
                                <MOListRelations name={obj.name} outgoingRelations={obj.outgoingRelations}/>
                            }
                        </Segment>
                    )}
                </Segment>
            </Segment.Group>
    );
}
