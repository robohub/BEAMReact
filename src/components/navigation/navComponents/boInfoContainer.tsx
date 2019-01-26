import * as React from 'react';

interface Props {
    selectedBO: string;
}

export default class BOInfoContainer extends React.Component<Props> {

    componentDidUpdate() {
        // RH ----------- OBS! Kolla att det är ett nytt objekt som ska ritas upp!!!!!!-----------
    }
    
    componentDidMount() {
        // RH ----------- OBS! Kolla att det är ett nytt objekt som ska ritas upp!!!!!!-----------
    }

    render() {  
        return (
            <div>
                Selected BO = {this.props.selectedBO}
                <div>
                    En list med fält
                </div>
                <div>
                    och relationer...
                </div>
            </div>
        );
    }
}  