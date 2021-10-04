import React from 'react';
import {useBem, useComponents} from "@steroidsjs/core/src/hooks";

import {Form} from '@steroidsjs/core/src/ui/form';
import PermissionRow from './views/PermissionRow';

import './SiteMapPage.scss';

const FORM_ID = 'SiteMapPage';

export const ACCESS_CONTEXT_API = 'a';
export const ACCESS_CONTEXT_MODELS = 'm';

interface ISiteMapPageProps {
    roles?: string[],
    permissions?: {
        name?: string,
        description?: string,
        children?: string[],
    }[],
    initialValues?: any,
    rulePrefix?: string,
    pageContext?: any,
}

export default function SiteMapPage (props: ISiteMapPageProps) {

    const components = useComponents()

    React.useEffect(() => {
        components.http.post('/api/gii/get-permissions', {
            prefix: props.pageContext,
        })
            .then(data => ({
                roles: data.roles,
                permissions: data.permissions,
                initialValues: data.initialValues,
            }))
    })

    const getRoots = () => {
        const children = [];
        props.permissions.forEach(permission => {
            if (permission.children) {
                children.push(...permission.children);
            }
        });

        return props.permissions.filter(permission => {
            return children.indexOf(permission.name) === -1;
        });
    }

    const bem = useBem('SiteMapPage')

    if (!props.roles) {
        return null;
    }

    return (
        <div className='container-fluid'>
            <Form
                formId={FORM_ID}
                action='/api/gii/permissions-save'
                className={bem(bem.block(), 'form-horizontal')}
                initialValues={props.initialValues}
            >
                <div
                    className={bem.element('roles')}
                    style={{
                        marginLeft: 400,
                        width: (400 + (props.roles.length * 200)),
                    }}
                >
                    {props.roles.map(role => (
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
                    {getRoots().map(permission => (
                        <PermissionRow
                            key={permission.name}
                            permission={permission}
                            roles={props.roles}
                            permissions={props.permissions}
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
    )
}
