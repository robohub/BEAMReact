import * as React from 'react';
import BOEditContainer from './BOEditContainer';
import { Drawer, Toolbar,  } from 'react-md';
import { BOEditType } from './../Types';

interface EditBOType {
    visible: boolean;
    handleVisibility: (showEditForm: boolean) => void;
    bizObject: BOEditType;
}

export default function EditDrawer({ visible, handleVisibility, bizObject,  }: EditBOType) {
    return (
        <Drawer
            type={Drawer.DrawerTypes.TEMPORARY}
            visible={visible}
            onVisibilityChange={handleVisibility}
            header={<Toolbar title="Edit ...xxx..." />}
            position={'right'}
            style={{paddingTop: 10, paddingLeft: 20, paddingRight: 20}}
        >
            {
                bizObject !== null ? 
                    <BOEditContainer 
                        newObject={false} 
                        metaID={bizObject.metaObject.id}
                        bizObject={bizObject}
                    />
                    :
                    <div/>
            }
        </Drawer>
    );
}
