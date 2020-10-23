import React from 'react';
import PropTypes from 'prop-types';

import {bem} from '@steroidsjs/core/hoc';
import Link from '@steroidsjs/core/ui/nav/Link';

import './SourceTreeView.scss';
import {ROUTE_SOURCES} from '../../index';

@bem('SourceTreeView')
export default class SourceTreeView extends React.Component {

    static propTypes = {
        items: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]),
            index: PropTypes.number,
            uniqId: PropTypes.string,
            level: PropTypes.number,
            label: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.any,
            ]),
            isOpened: PropTypes.bool,
            hasItems: PropTypes.bool,
            onClick: PropTypes.func,
            itemsType: PropTypes.string,
            itemsParams: PropTypes.object,
        })),
        className: PropTypes.string,
        levelPadding: PropTypes.number,
    };

    static defaultProps = {
        levelPadding: 20,
    };

    render() {
        const bem = this.props.bem;
        return (
            <ul className={bem(bem.block(), this.props.className)}>
                {this.props.items.map(item => {
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
                                    paddingLeft: String(item.level * this.props.levelPadding) + 'px',
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

}
