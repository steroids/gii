import React from 'react';
import {Notifications} from '@steroidsjs/core/ui/layout';
import layout, {STATUS_LOADING, STATUS_OK} from '@steroidsjs/core/hoc/layout';

import {bem, components} from '@steroidsjs/core/hoc';
import {ROUTE_ROOT} from '../../routes';
import './Layout.scss';
import Header from '@steroidsjs/core/ui/layout/Header';

@bem('Layout')
@components('http')
@layout(
    props => props.http.post('/api/gii/init', {
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
export default class Layout extends React.PureComponent {

    static propTypes = {
    };

    render() {
        const bem = this.props.bem;
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
                    {this.renderContent()}
                </div>
            </div>
        );
    }

    renderContent() {
        switch (this.props.status) {
            case STATUS_LOADING:
                return null;

            case STATUS_OK:
                return this.props.children;
        }

        // TODO other statuses
        return this.props.status;
    }

}
