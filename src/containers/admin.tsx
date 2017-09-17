import * as React from 'react';
import MultiStep, { StepsComponent } from '../utils/multistep';

import ObjectsList from '../components/admin/objectList';
import SelectAttributes from '../components/admin/selectAttributes';
// import GenerateModel from '../components/admin/generateModel';

const steps: StepsComponent[] =
    [
        {name: 'Select an object', component: <ObjectsList/>},
        {name: 'Edit object', component: <SelectAttributes/>},
        /*{name: 'Generate model', component: <GenerateModel/>},*/
    ];

export default class Admin extends React.Component {
    
    render() {  
        return (
            <MultiStep steps={steps}/>
        );
    }
}  