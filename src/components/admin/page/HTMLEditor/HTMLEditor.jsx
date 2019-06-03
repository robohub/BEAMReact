import * as $ from 'jquery';
window.$ = $;

// Require Editor JS files.
import 'froala-editor/js/froala_editor.pkgd.min.js';

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

// Require Font Awesome.fon
import 'font-awesome/css/font-awesome.css';

import FroalaEditor from './../../../../../node_modules/react-froala-wysiwyg';
// import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';

// Include special components if required.
// import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';
// import FroalaEditorA from 'react-froala-wysiwyg/FroalaEditorA';
// import FroalaEditorButton from 'react-froala-wysiwyg/FroalaEditorButton';
// import FroalaEditorImg from 'react-froala-wysiwyg/FroalaEditorImg';
// import FroalaEditorInput from 'react-froala-wysiwyg/FroalaEditorInput';

// ReactDOM.render(<FroalaEditor tag="textarea"/>, document.getElementById('editor'));

import { client } from '../../../../index';
import gql from 'graphql-tag';
// import { Button } from '@material-ui/core';

import * as React from 'react';

import { Widget } from '../widget/types';

export const getHTMLWidget = gql`
query getWidget($id: string) {
    widget(
        where: {id: $id}
    ) {
        id
        text
    }
}
`;
/* when this file .jsx --> .tsx
type State = {
    model: string;
};

interface Props {
    widgetId: string;
    save?: boolean;
    onSave?: (widget: Widget) => void;
}
*/
export default class EditorComponent extends React.Component {
   state = {
        model: 'Start editing...'
    };

    componentDidMount() {
        if (this.props.widgetId) {
            client.query({
                query: getHTMLWidget,
                variables: {
                    id: this.props.widgetId
                }
            }).then(result => {
                // tslint:disable-next-line:no-console
                console.log('Result:' + result.data.widget);
                if (result.data.widget) {
                    this.setState({
                        model: result.data.widget.text
                    });
                }
            });
        }
    }

    componentDidUpdate() {
        if (this.props.save) {
            this.props.onSave({model: this.state.model, type: '', name: ''});
        }
    }

    componentWillUnmount() {
        // tslint:disable-next-line:no-console
        console.log('Editor will be DESTROYED!!!!');
    }

    render() {

        // tslint:disable-next-line:no-console
        console.log('################ HTMLEditor RENDERAR ....');

        return (
            <div>
                <FroalaEditor
                    model={this.state.model}
                    onModelChange={val => this.setState({model: val})}
                    config={{
                        paragraphStyles: {   // RH these classes are defined in App.css!
                            robclass1: 'Yellow background',
                            robclass2: 'Class 2',
                        }
                    }}
                />
            </div>
        );
    }
}
