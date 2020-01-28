import React from 'react';
import {Link, Nav} from '@steroids2/core/ui/nav';
import {Notifications} from '@steroids2/core/ui/layout';
import layout, {STATUS_LOADING, STATUS_OK} from '@steroids2/core/hoc/layout';

import {bem, components} from '@steroids2/core/hoc';
import {ROUTE_ROOT} from '../../routes';
import './Layout.scss';

@bem('Layout')
@components('http')
@layout(
    props => props.http.post('/api/gii/init', {
        timestamp: Date.now(),
        models: [
            'steroids.gii.forms.EnumEntity',
            'steroids.gii.forms.EnumItemEntity',
            'steroids.gii.forms.ModelEntity',
            'steroids.gii.forms.ModelAttributeEntity',
            'steroids.gii.forms.ModelRelationEntity',
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
                <nav className={bem('navbar navbar-expand-md navbar-dark', bem.element('header'))}>
                    <div>
                        <Link
                            className={bem('navbar-brand', bem.element('logo'))}
                            toRoute={ROUTE_ROOT}
                        >
                            Steroids Gii
                        </Link>
                    </div>
                    <Nav
                        layout='navbar'
                        items={[
                        ]}
                    />
                </nav>
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
