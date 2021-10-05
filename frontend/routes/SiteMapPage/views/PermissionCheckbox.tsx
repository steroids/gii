import React from 'react';
import {Field, change} from 'redux-form';
import {useBem} from "@steroidsjs/core/hooks";
import useDispatch from "@steroidsjs/core/hooks/useDispatch";

import './PermissionCheckbox.scss';

const FORM_ID = 'AccessRulesEditor';

interface IPermissionCheckboxProps {
    role?: string,
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
    showTooltip?: boolean,
}

export default function PermissionCheckbox (props: IPermissionCheckboxProps) {

    const dispatch = useDispatch()

    const [isTooltipOpen, setIsTooltipOpen] = React.useState<boolean>(false)

    const label = (
        <label>
            <Field
                name={`rules[${props.role}][${props.permission.name}]`}
                component='input'
                type='checkbox'
                onClick={() => setIsTooltipOpen(e => !e)}
            />
        </label>
    );

    const tooltipId = 'tooltip_' + props.role + '_' + props.permission.name.replace(/[^0-9a-z]+/g, '_');

    const _onChange = (e) => {
        const isChecked = e.target.checked;

        // Change children
        dispatch(getChildrenNamesRecursive(props.permission.name).map(name => {
            return change(FORM_ID, `rules[${props.role}][${name}]`, isChecked);
        }));

        // Uncheck parent
        if (!isChecked) {
            dispatch(getParentNamesRecursive(props.permission.name).map(name => {
                return change(FORM_ID, `rules[${props.role}][${name}]`, false);
            }));
        }
    }

    /**
     * @param {string} permissionName
     * @returns {string[]}
     */
    const getChildrenNamesRecursive = (permissionName) => {
        const permission = props.permissions.find(permission => permission.name === permissionName);
        const names = [].concat(permission.children || []);
        names.forEach(childrenName => {
            names.push(...getChildrenNamesRecursive(childrenName));
        });
        return names;
    }

    /**
     * @param {string} permissionName
     * @returns {string[]}
     */
    const getParentNamesRecursive = (permissionName) => {
        const names = [];
        const parentPermission = props.permissions.find(permission => {
            return (permission.children || []).indexOf(permissionName) !== -1;
        });
        if (parentPermission) {
            names.push(parentPermission.name);
            names.push(...getParentNamesRecursive(parentPermission.name));
        }
        return names;

    }

    const bem = useBem('PermissionCheckbox');

    return (
        <div
            key={props.permission.name}
            className={bem.element('checkbox')}
        >
            <div id={tooltipId}>
                {label}
            </div>
            {/* TODO this.props.showTooltip && (
                    <Tooltip
                        placement='top'
                        isOpen={isTooltipOpen}
                        target={tooltipId}
                        toggle={() => setIsTooltipOpen(e => !e)})}
                    >
                        {this.props.permission.description}
                    </Tooltip>
                )*/}
        </div>
    );
}
