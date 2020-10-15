import React from 'react';
import {Resize, ResizeHorizon} from 'react-resize-layout';
import {bem, components} from '@steroidsjs/core/hoc';
import Tree from '@steroidsjs/core/ui/nav/Tree';
import {connect} from 'react-redux';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import _isArray from 'lodash/isArray';
import _mergeWith from 'lodash/mergeWith';
import _isEmpty from 'lodash/isEmpty';
import * as queryString from 'qs';
import {goToRoute} from '@steroidsjs/core/actions/router';
import Loader from '@steroidsjs/core/ui/layout/Loader';

import {ROUTE_SOURCES} from '../index';
import EnumView from './views/EnumView';
import ClassType from '../../enums/ClassType';
import ModelView from './views/ModelView';

import './SourcesPage.scss';
import SourceTreeView from './views/SourceTreeView';
import {reInit} from '@steroidsjs/core/actions/auth';
import ModuleView from './views/ModuleView';
import CrudCreatorView from '../ClassCreatorPage/views/CrudCreatorView';

@connect(
    state => ({
        applications: _get(state, 'auth.data.applications'),
        types: _get(state, 'auth.data.types'),
    })
)
@bem('SourcesPage')
@components('http')
export default class SourcesPage extends React.PureComponent {

    static propTypes = {};

    constructor() {
        super(...arguments);

        this._onTreeClick = this._onTreeClick.bind(this);
        this._onEntitySubmit = this._onEntitySubmit.bind(this);

        this.state = {
            entity: null,
            isLoading: false,
            classesByType: {},
            ...this._fetchEntity(),
        };
    }

    componentDidMount() {
        this.setState({
            classesByType: this._extractClasses(this.props.applications),
        });
    }

    componentDidUpdate(prevProps) {
        const prevParams = _get(prevProps, 'match.params');
        const params = _get(this.props, 'match.params');
        if (!_isEqual(prevParams, params)) {
            this.setState({
                entity: null, // Force destroy Form
            }, () => {
                const state = this._fetchEntity();
                if (state) {
                    this.setState(state);
                }
            });
        }

        if (prevProps.applications !== this.props.applications) {
            this.setState({
                classesByType: this._extractClasses(this.props.applications),
            });
        }
    }

    render() {
        if (!this.props.types) {
            return null;
        }

        const bem = this.props.bem;
        return (
            <div className={bem.block()}>
                <Resize
                    handleWidth='12px'
                    handleColor='transparent'
                >
                    <ResizeHorizon
                        minWidth='200px'
                        width='300px'
                        overflow='auto'
                        className={bem.element('tree-wrapper')}
                    >
                        <div className={bem.element('tree')}>
                            <Tree
                                id='source'
                                items={this.props.applications}
                                selectedItemId={this.props.match.params.id}
                                onItemClick={this._onTreeClick}
                                view={SourceTreeView}
                                autoSave
                            />
                        </div>
                    </ResizeHorizon>
                    <ResizeHorizon
                        minWidth='600px'
                        overflow='auto'
                        className={bem.element('content-wrapper')}
                    >
                        <div className={bem.element('content')}>
                            {this.state.isLoading && (
                                <Loader/>
                            ) || (
                                this.renderEntity()
                            )}
                        </div>
                    </ResizeHorizon>
                </Resize>
            </div>
        );
    }

    renderEntity() {
        if (!this.state.entity) {
            return null;
        }

        const type = this.props.match.params.type;
        switch (type) {
            case ClassType.CRUD:
            case ClassType.MODULE:
            case ClassType.MODEL:
            case ClassType.FORM:
            case ClassType.ENUM:
                const viewsMap = {
                    [ClassType.MODULE]: ModuleView,
                    [ClassType.MODEL]: ModelView,
                    [ClassType.FORM]: ModelView,
                    [ClassType.ENUM]: EnumView,
                    [ClassType.CRUD]: CrudCreatorView,
                };
                const EntityView = viewsMap[this.props.match.params.type];
                return (
                    <EntityView
                        entity={this.state.entity}
                        initialValues={{
                            ...this.state.entity,
                        }}
                        types={this.props.types}
                        classesByType={this.state.classesByType}
                        classType={type}
                        onSubmit={this._onEntitySubmit}
                    />
                );
        }

        return null;
    }

    _onTreeClick(e, item) {
        if (!item.items && item.id) {
            this.props.dispatch(goToRoute(ROUTE_SOURCES, {
                type: item.type,
                id: item.id.replace(/\\/g, '-'),
            }));
        }
    }

    _extractClasses(items) {
        const comparator = (objValue, srcValue) => {
            if (_isArray(objValue)) {
                srcValue.forEach(className => {
                    // skip exist class name
                    if (!objValue.includes(className)) {
                        objValue.push(className);
                    }
                });
                return objValue;
            }
        };
        let classes = {};
        (items || []).forEach((item) => {
            if (item.type && item.className) {
                if (_isEmpty(classes[item.type])) {
                    classes[item.type] = [];
                }
                classes[item.type].push(item.className);
            }

            if (item?.items) {
                classes = _mergeWith(classes, this._extractClasses(item.items), comparator);
            }
        });
        return classes;
    }

    _fetchEntity() {
        const {type, id} = _get(this.props, 'match.params');
        if (type) {
            if (ClassType.getKeys().includes(type)) {
                if (id) {
                    this.props.http.get(`/api/gii/entities/${type}`, {id})
                        .then(entity => {
                            this.setState({
                                entity,
                                isLoading: false,
                            });
                        });
                } else if (this.props.location.search.length > 1) {
                    return {
                        entity: queryString.parse(this.props.location.search.substr(1)),
                        isLoading: false,
                    };
                }
            }
            return null;
        }
        return {
            isLoading: true,
        };
    }

    _onEntitySubmit(values) {
        const {type, id} = _get(this.props, 'match.params');
        if (type && !_isEmpty(values)) {
            this.props.http.post(`/api/gii/entities/${type}`, {
                ...values,
                id,
            })
                .then(entity => {
                    this.props.dispatch(goToRoute(ROUTE_SOURCES, {
                        type: entity.type,
                        id: entity.id,
                    }));

                    this.props.dispatch(reInit());
                });
        }
    }

}
