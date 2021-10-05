import React from 'react';
import {useBem} from "@steroidsjs/core/hooks";
import {ROUTE_SOURCES} from '../../index';

import Link from '@steroidsjs/core/ui/nav/Link';

import './SourceTreeView.scss';

interface ISourceTreeViewProps {
    items?: {
        id?: string | number,
        index?: number,
        uniqId?: string,
        level?: number,
        label?: string | any,
        isOpened?: boolean,
        hasItems?: boolean,
        onClick?: any,
        itemsType?: string,
        itemsParams?: any,
        visible?: boolean,
        isSelected?: boolean,
        className?: string,
    }[],
    className?: string,
    levelPadding?: number,
}

function SourceTreeView (props: ISourceTreeViewProps) {

    const bem = useBem('SourceTreeView');
    return (
        <ul className={bem(bem.block(), props.className)}>
            {props.items.map(item => {
                if (item.visible === false) {
                    return null;
                }

                return (
                    <li
                        key={item.uniqId}
                        onClick={item.onClick}
                        className={bem(
                            bem.element('item', {
                                selected: item.isSelected,
                                opened: item.isOpened,
                                'has-items': item.hasItems,
                            }),
                            item.className
                        )}
                    >
                        <div
                            className={bem.element('item-label')}
                            style={{
                                paddingLeft: String(item.level * props.levelPadding) + 'px',
                            }}
                        >
                            {item.label}
                            {item.itemsType && (
                                <Link
                                    label='+'
                                    className={bem.element('item-button')}
                                    toRoute={ROUTE_SOURCES}
                                    toRouteParams={{
                                        type: item.itemsType,
                                        id: null,
                                        ...item.itemsParams,
                                    }}
                                />
                            )}
                        </div>
                    </li>
                )
            })}
        </ul>
    );

}

SourceTreeView.defaultProps = {
    levelPadding: 20,
}

export default SourceTreeView;
