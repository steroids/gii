import {Redirect} from 'react-router';

import SourcesPage from './SourcesPage';
import SiteMapPage from './SiteMapPage';

export const ROUTE_ROOT = 'root';
export const ROUTE_SOURCES = 'sources';
export const ROUTE_SITE_MAP = 'site_map';

const roles = [null];

export default {
    id: ROUTE_ROOT,
    exact: true,
    path: '/(gii)?',
    component: Redirect,
    componentProps: {
        to: '/gii/sources',
    },
    roles,
    items: {
        [ROUTE_SOURCES]: {
            exact: true,
            path: '/gii/sources/:type?/:id?',
            label: __('Исходники'),
            layout: 'blank',
            roles,
            component: SourcesPage,
        },
        [ROUTE_SITE_MAP]: {
            exact: true,
            path: '/gii/site-map',
            label: __('Карта сайта'),
            layout: 'blank',
            roles,
            component: SiteMapPage,
        },
    }
};
