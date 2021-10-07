import React from 'react';
import useApplication from "@steroidsjs/core/hooks/useApplication";

import LocaleComponent from "@steroidsjs/core/components/LocaleComponent";
import MetaComponent from "@steroidsjs/core/components/MetaComponent";
import HttpComponent from "@steroidsjs/core/components/HttpComponent";

import 'style/index.scss';

export default function Application () {
    const {renderApplication} = useApplication({
        reducers: require('@steroidsjs/core/reducers').default,
        routes: () => require('routes').default,
        layoutView: () => require('shared/Layout').default,
        screen: true,
        components: {
            locale: {
                className: LocaleComponent,
            },
            meta: {
                className: MetaComponent,
            },
            http: HttpComponent,
        },
        onInit: ({ui}) => {
            // Automatically import all views
            ui.addViews(require.context('@steroidsjs/bootstrap', true, /View.(js|tsx)$/));
            ui.addFields(require.context('@steroidsjs/bootstrap', true, /Field.(js|tsx)$/));
            ui.addFormatters(require.context('@steroidsjs/bootstrap', true, /Formatter.(js|tsx)$/));

            // Automatically import all fields and formatters from steroids
            ui.addFields(require.context('@steroidsjs/core/ui', true, /Field.tsx?$/));
            ui.addFormatters(require.context('@steroidsjs/core/ui', true, /Formatter.tsx?$/));

            // Automatically import all default icons
            ui.addIcons(require('@steroidsjs/bootstrap/icon/fontawesome').default);
        }
    })

    return renderApplication(
        // <Router
        //     wrapperView={() => require('steroids/gii/frontend/shared/Layout').default}
        //     routes={() => require('steroids/gii/frontend/routes').default}
        // />
    );
}
