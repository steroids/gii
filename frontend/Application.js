import React from 'react';
import {hot} from 'react-hot-loader';
import Router from '@steroids2/core/ui/nav/Router';
import {application} from '@steroids2/core/hoc';

import 'style/index.scss';

@hot(module)
@application({
    onInit: ({ui}) => {
        // Automatically import all views
        ui.addViews(require.context('@steroids2/bootstrap', true, /View.js$/));
        ui.addFields(require.context('@steroids2/bootstrap', true, /Field.js$/));
        ui.addFormatters(require.context('@steroids2/bootstrap', true, /Formatter.js$/));

        // Automatically import all fields and formatters from steroids
        ui.addFields(require.context('@steroids2/core/ui', true, /Field.js$/));
        ui.addFormatters(require.context('@steroids2/core/ui', true, /Formatter.js$/));
    },
})
export default class Application extends React.PureComponent {

    render() {
        return (
            <Router
                wrapperView={require('shared/Layout').default}
                routes={require('routes').default}
            />
        );
    }
}
