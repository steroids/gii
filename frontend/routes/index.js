import {Redirect} from 'react-router';

import SourcesPage from './SourcesPage';

export const ROUTE_ROOT = 'root';
export const ROUTE_SOURCES = 'sources';

const roles = [null];

export default {
    id: ROUTE_ROOT,
    exact: true,
    path: '/',
    component: Redirect,
    componentProps: {
        to: '/sources',
    },
    roles,
    items: {
        [ROUTE_SOURCES]: {
            exact: true,
            path: '/sources/:type?/:namespace?/:name?',
            title: __('Исходники'),
            layout: 'blank',
            roles,
            component: SourcesPage,
        },
    }
};
