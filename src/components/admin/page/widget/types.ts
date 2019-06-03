import * as React from 'react';

export interface Widget {
    id?: string; type: string; name?: string; model?: string; boid?: string;
}

export const WidgetContext = React.createContext({
    state: null,
    updateModel: (value: string) => null
});
