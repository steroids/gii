import React from 'react';
import {Collapse} from 'react-collapse';
import {Field, formValueSelector} from 'redux-form';
import {useBem, useSelector} from "@steroidsjs/core/src/hooks";

import PermissionCheckbox from './PermissionCheckbox';

import './PermissionRow.scss';

const FORM_ID = 'AccessRulesEditor';
const selector = formValueSelector(FORM_ID);

// const WrappedPermissionRow = useBem('PermissionRow')

interface IPermissionRowProps {
    roles?: string[],
    permissions?: {
        name?: string,
        description?: string,
        children?: string[],
    }[],
    permission?: {
        name?: string,
        description?: string,
        children?: string[],
    },
    parentPermission?: string,
    level?: number,
    checkedCount?: number,
    enableInlineMode?: boolean,
    visible?: boolean,
}

function PermissionRow (props: IPermissionRowProps) {

    const bem = useBem('PermissionRow')

    const {checkedCount} = useSelector(state => {
        // Count child checked items
        let checkedCount = 0;
        const formRules = selector(state, 'rules') || {};
        const countChecked = function(permissionName) {
            Object.keys(formRules).map(role => {
                if (formRules[role][permissionName]) {
                    checkedCount++;
                }
            });

            const permission = props.permissions.find(permission => permission.name === permissionName);
            (permission.children || []).forEach(countChecked);
        };
        countChecked(props.permission.name);

        return {
            checkedCount,
        };
    })

    const [isExpanded, setIsExpanded] = React.useState<boolean>(false)

    const getChildren = () => {
        return _getItems(false);
    }

    const getInline = () => {
        if (!props.enableInlineMode) {
            return [];
        }
        return _getItems(true);
    }

    const _getItems = (isInline) => {
        if (!props.permission.children) {
            return [];
        }
        return props.permissions.filter(permission => {
            if (props.permission.children.indexOf(permission.name) === -1) {
                return false;
            }

            if (props.enableInlineMode) {
                return isInline === !permission.children;
            }
            return true;
        });
    }

    if (!props.visible) {
        return (
            <div>
                {props.roles.map(role => (
                    <Field
                        key={role}
                        name={`rules[${role}][${props.permission.name}]`}
                        component='input'
                        type='hidden'
                    />
                ))}
                {getChildren().map(children => (
                    <PermissionRow
                        key={children.name}
                        permission={children}
                        roles={props.roles}
                        permissions={props.permissions}
                        enableInlineMode={props.enableInlineMode}
                        level={props.level + 1}
                        visible={false}
                    />
                ))}
            </div>
        );
    }


    return (
        <div className={bem.block()}>
            <div
                style={{
                    width: (400 + (props.roles.length * 200)),
                }}
            >
                <div
                    className={bem.element('container')}
                    style={{width: 400}}
                >
                    {getChildren().length > 0 && (
                        <a
                            href='javascript:void(0)'
                            className={bem.element('link')}
                            onClick={() => setIsExpanded(e => !e)}
                            style={{
                                marginLeft: 30 * props.level,
                            }}
                        >
                                    <span className={bem.element('collapse-icon')}>
                                        {!isExpanded ? '+' : '-'}
                                    </span>
                            <span className={bem.element('description')}>
                                        <code>
                                            {props.permission.description}
                                        </code>
                                &nbsp;
                                {checkedCount > 0 && (
                                    <span className='badge'>
                                                {checkedCount}
                                            </span>
                                )}
                                    </span>
                        </a>
                    ) ||
                    (
                        <div
                            className={bem.element('link')}
                            style={{
                                marginLeft: 30 * props.level,
                            }}
                        >
                                    <span className={bem.element('description')}>
                                        <code>
                                            {props.permission.description}
                                        </code>
                                    </span>
                        </div>
                    )}
                </div>
                {props.roles.map(role => (
                    <div
                        key={role}
                        style={{width: 200}}
                        className={bem.element('checkboxes')}
                    >
                        <PermissionCheckbox
                            permissions={props.permissions}
                            permission={props.permission}
                            role={role}
                        />
                        {getInline().map(children => (
                            <PermissionCheckbox
                                key={children.name}
                                permissions={props.permissions}
                                permission={children}
                                role={role}
                                showTooltip
                            />
                        ))}
                    </div>
                ))}
            </div>
            {getChildren().length > 0 && (
                <Collapse isOpened={isExpanded}>
                    <div>
                        {getChildren().map(children => (
                            <PermissionRow
                                key={children.name}
                                permission={children}
                                roles={props.roles}
                                permissions={props.permissions}
                                enableInlineMode={props.enableInlineMode}
                                level={props.level + 1}
                                visible={isExpanded}
                            />
                        ))}
                    </div>
                </Collapse>
            )}
        </div>
    );
}

PermissionRow.defaultProps = {
    level: 0,
}

export default PermissionRow;
