import React from 'react';
import {Resize, ResizeHorizon} from 'react-resize-layout';
import {bem, components} from '@steroidsjs/core/hoc';
import Tree from '@steroidsjs/core/ui/nav/Tree';
import {connect} from 'react-redux';
import _get from 'lodash/get';
import _has from 'lodash/has';
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
import _orderBy from "lodash/orderBy";
import _values from "lodash/values";

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
        if (!_isEqual(prevParams, params) || prevProps.location.search !== this.props.location.search) {
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

        let namespace = '';
        if (this.state.entity && !_get(this.state.entity, 'name') && _get(this.state.entity, 'namespace')) {
            namespace = this.state.entity.namespace;
        }

        if (this.props.location.search.length > 0) {
            const result = queryString.parse(this.props.location.search.substr(1));
            namespace = result.namespace;
        }

        let selectedItemId = this.props.match.params.id;
        if (!selectedItemId) {
            const parseNamespace = this._parseNamespace(this.props.applications, namespace);
            selectedItemId = parseNamespace.split('.').pop();
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
                                selectedItemId={selectedItemId}
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

    _parseNamespace(items, namespace = '') {
        let routePath = '';
        if (namespace.length === 0) {
            return routePath;
        }

        const tokens = namespace.split('\\');
        const firstToken = tokens.shift();

        if (!firstToken || !items) {
            return routePath;
        }

        for (let route of items) {
            const isExistRoute = route.id.toString().includes(firstToken);
            if (isExistRoute) {
                routePath = route.id.toString();
                const subRoutePath = this._parseNamespace(route.items, tokens.length !== 0 ? tokens.join('\\') : '');
                return subRoutePath.length === 0 ? routePath : routePath + '.' + subRoutePath;
            }
        }
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
                        sampleAttributes={this._getSampleAttributes()}
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

    /**
     * Return items group by of type entities
     *
     * Example of default behaviour with attribute className
     * ```
     * {
     *     model: ['steroids\auth\models\AuthConfirm','steroids\auth\models\Login'],
     *     crud: ['steroids\auth\crud\AuthConfirmCrud'],
     *     form: ['steroids\auth\form\AuthConfirmForm'],
     *     enum: ['steroids\auth\enum\ConfirmEnum'],
     * }
     * ```
     */
    _extractClasses(items, attribute = 'className') {
        const comparator = (objValue, srcValue) => {
            if (_isArray(objValue)) {
                srcValue.forEach(attribute => {
                    // skip exist element
                    if (!objValue.includes(attribute)) {
                        objValue.push(attribute);
                    }
                });
                return objValue;
            }
        };

        let classes = {};
        (items || []).forEach((item) => {
            if (item.type && _has(item, attribute)) {
                if (_isEmpty(classes[item.type])) {
                    classes[item.type] = [];
                }
                classes[item.type].push(item[attribute]);
            }

            if (item?.items) {
                classes = _mergeWith(classes, this._extractClasses(item.items, attribute), comparator);
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

    _getSampleAttributes() {
        const extractClasses = this._extractClasses(this.props.applications, 'attributeItems');
        const uniqueAttributes = [];
        [...extractClasses['model'], ...extractClasses['form']].forEach(modelAttributes => {
            if (modelAttributes.length > 0) {
                modelAttributes.forEach(attribute => {
                    if (!_get(uniqueAttributes[attribute.name])) {
                        uniqueAttributes[attribute.name] = attribute;
                    }
                });
            }
        });

        const sampleAttributes = {};
        const defaultSamples = {
            id: ['primaryKey', 'ID'],
            title: ['string', 'Название'],
            email: ['email', 'Email'],
            phone: ['phone', 'Телефон'],
            password: ['password', 'Пароль'],
            photo: ['file', 'Фотография'],
            photos: ['files', 'Фотографии'],
            image: ['file', 'Изображение'],
            images: ['files', 'Изображения'],
            file: ['file', 'Файл'],
            files: ['files', 'Файлы'],
            passwordAgain: ['password', 'Повтор пароля'],
            description: ['text', 'Описание'],
            content: ['text', 'Контент'],
            userId: ['integer', 'Пользователь'],
            authorId: ['integer', 'Автор'],
            isEnable: ['boolean', 'Включен?'],
            isDeleted: ['boolean', 'Удален?'],
            status: ['enum', 'Статус'],
            createTime: ['autoTime', 'Добавлен'],
            updateTime: ['autoTime', 'Обновлен', {touchOnUpdate: true}],
        };

        Object.keys(defaultSamples).forEach(id => {
            sampleAttributes[id] = {
                counter: 1,
                params: {
                    appType: defaultSamples[id][0],
                    label: defaultSamples[id][1],
                    ...defaultSamples[id][2],
                }
            };
        });

        for (const [key, attribute] of Object.entries(uniqueAttributes)) {
            if (sampleAttributes[attribute.name]) {
                sampleAttributes[attribute.name].counter++;
            } else {
                sampleAttributes[attribute.name] = {
                    counter: 1,
                    params: {
                        appType: attribute.appType,
                        defaultValue: attribute.defaultValue,
                        example: attribute.example,
                        hint: attribute.hint,
                        label: attribute.label,
                    },
                };
            }
        }

        Object.keys(sampleAttributes).forEach(id => {
            sampleAttributes[id].id = id;
            sampleAttributes[id].label = id;
        });
        return _orderBy(_values(sampleAttributes), 'counter', 'desc');
    }

}
