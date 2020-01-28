import React from 'react';
import {hot} from 'react-hot-loader';
import Router from '@steroidsjs/core/ui/nav/Router';
import {application} from '@steroidsjs/core/hoc';

import 'style/index.scss';

@hot(module)
@application({
    onInit: ({ui}) => {
        // Automatically import all views
        ui.addViews(require.context('@steroidsjs/bootstrap', true, /View.js$/));
        ui.addFields(require.context('@steroidsjs/bootstrap', true, /Field.js$/));
        ui.addFormatters(require.context('@steroidsjs/bootstrap', true, /Formatter.js$/));

        // Automatically import all fields and formatters from steroids
        ui.addFields(require.context('@steroidsjs/core/ui', true, /Field.js$/));
        ui.addFormatters(require.context('@steroidsjs/core/ui', true, /Formatter.js$/));
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
