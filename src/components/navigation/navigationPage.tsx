import * as React from 'react';
import NavigationView from './navComponents/navigationView';

export default class Admin extends React.Component {
    render() {  
        return (
            <div style={{height: '90vh'}}>
                <NavigationView defaultBO="ROBERTS ODEFINIERADE"/>
            </div>
        );
    }
}  