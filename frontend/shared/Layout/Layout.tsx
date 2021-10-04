import React from 'react';
import {useBem, useComponents} from "../../../../react/src/hooks";
import useLayout, {STATUS_LOADING, STATUS_OK} from '@steroidsjs/core/src/hooks/useLayout';
import {ROUTE_ROOT} from '../../routes';

import Header from '@steroidsjs/core/src/ui/layout/Header';
import {Notifications} from '@steroidsjs/core/src/ui/layout';

import './Layout.scss';

export default function Layout (props: any) {

    const components = useComponents()

    useLayout(() => components.http.post('/api/gii/init', {
        timestamp: Date.now(),
        models: [
            'steroids.gii.forms.BackendEnumEntity',
            'steroids.gii.forms.BackendEnumItemEntity',
            'steroids.gii.forms.BackendModelEntity',
            'steroids.gii.forms.BackendModelAttributeEntity',
            'steroids.gii.forms.BackendModelRelationEntity',
            'steroids.gii.forms.BackendModuleEntity',
        ],
        enums: [
            'steroids.gii.enums.RelationType',
            'steroids.gii.enums.ClassType',
            'steroids.gii.enums.MigrateMode',
        ],
        })
    )

    const renderContent = () => {
        switch (props.status) {
            case STATUS_LOADING:
                return null;

            case STATUS_OK:
                return props.children;
        }

        // TODO other statuses
        return props.status;
    }

    const bem = useBem('Layout');
    return (
        <div className={bem.block()}>
            <Header
                className={bem('navbar-dark', bem.element('header'))}
                logo={{
                    title: 'Steroids Gii',
                }}
                nav={{
                    items: ROUTE_ROOT,
                }}
            />
            <div className={bem.element('content')}>
                <Notifications/>
                {renderContent()}
            </div>
        </div>
    );
}
