import * as React from 'react';
import { Row } from 'reactstrap';

import AttributeList from './attributeList';
import ObjectDetails from './objectDetails';

export default class SelectAttributes extends React.Component {
    
    render() {  
        return (
            <div>
                <Row>
                    <ObjectDetails/>
                </Row>
                <Row>
                    <AttributeList/>
                </Row>
            </div>
        );
    }
}