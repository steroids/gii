import React from 'react';
import PropTypes from 'prop-types';
import {Form} from '@steroidsjs/core/ui/form';

import PermissionRow from './views/PermissionRow';

import './SiteMapPage.scss';
import {bem, components, http} from '@steroidsjs/core/hoc';

const FORM_ID = 'SiteMapPage';

@bem('SiteMapPage')
@components('http')
@http(props => (
    props.http.post('/api/gii/get-permissions', {
        prefix: 'a',
    })
        .then(data => ({
            roles: data.roles,
            permissions: data.permissions,
            initialValues: data.initialValues,
        }))
))
export default class SiteMapPage extends React.PureComponent {

    static propTypes = {
        roles: PropTypes.arrayOf(PropTypes.string),
        permissions: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string,
            children: PropTypes.arrayOf(PropTypes.string),
        })),
        initialValues: PropTypes.object,
        rulePrefix: PropTypes.string,
    };

    render() {
        if (!this.props.roles) {
            return null;
        }

        const bem = this.props.bem;
        return (
            <div className='container-fluid'>
                <Form
                    formId={FORM_ID}
                    action='/api/gii/permissions-save'
                    className={bem(bem.block(), 'form-horizontal')}
                    initialValues={this.props.initialValues}
                >
                    <div
                        className={bem.element('roles')}
                        style={{
                            marginLeft: 400,
                            width: (400 + (this.props.roles.length * 200)),
                        }}
                    >
                        {this.props.roles.map(role => (
                            <div
                                key={role}
                                className={bem(bem.element('roles-item'))}
                                style={{width: 200}}
                            >
                                {role}
                            </div>
                        ))}
                    </div>
                    <div className={bem.element('permissions')}>
                        {this.getRoots().map(permission => (
                            <PermissionRow
                                key={permission.name}
                                permission={permission}
                                roles={this.props.roles}
                                permissions={this.props.permissions}
                                visible
                            />
                        ))}
                    </div>
                    <div className='form-group'>
                        <div className='col-xs-12'>
                            <button
                                type='submit'
                                className='btn btn-success'
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </Form>
            </div>
        );
    }

    getRoots() {
        const children = [];
        this.props.permissions.forEach(permission => {
            if (permission.children) {
                children.push(...permission.children);
            }
        });

        return this.props.permissions.filter(permission => {
            return children.indexOf(permission.name) === -1;
        });
    }

}
