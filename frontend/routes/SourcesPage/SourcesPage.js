import React from 'react';
import {Resize, ResizeHorizon} from 'react-resize-layout';
import {bem, components} from '@steroids2/core/hoc';
import Tree from '@steroids2/core/ui/nav/Tree';
import {connect} from 'react-redux';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import {goToPage} from '@steroids2/core/actions/navigation';
import Loader from '@steroids2/core/ui/layout/Loader';

import {ROUTE_SOURCES} from '../index';
import EnumView from './views/EnumView';
import ClassType from '../../enums/ClassType';
import ModelView from './views/ModelView';

import './SourcesPage.scss';

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

        this._onEntitySubmit = this._onEntitySubmit.bind(this);

        this.state = {
            entity: null,
            isLoading: false,
            classesByType: {},
            ...this._fetchEntity(),
        };
    }

    componentDidUpdate(prevProps) {
        const prevParams = _get(prevProps, 'match.params');
        const params = _get(this.props, 'match.params');
        if (!_isEqual(prevParams, params)) {
            const state = this._fetchEntity();
            if (state) {
                this.setState(state);
            }
        }

        if (prevProps.applications !== this.props.applications) {
            this.setState({
                classesByType: this._extractClasses(this.props.applications),
            });
        }
    }

    render() {
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
                    >
                        <div className={bem.element('tree')}>
                            <Tree
                                id='source'
                                items={this.props.applications}
                                onItemClick={(e, item) => {
                                    if (item.namespace && item.name) {
                                        this.props.dispatch(goToPage(ROUTE_SOURCES, {
                                            type: item.type,
                                            namespace: item.namespace.replace(/\\/g, '-'),
                                            name: item.name,
                                        }));
                                    }
                                }}
                                autoSave
                            />
                        </div>
                    </ResizeHorizon>
                    <ResizeHorizon minWidth='600px'
                                   overflow='auto'>
                        <div className={bem.element('content')}>
                            {this.state.isLoading && (
                                <Loader/>
                            ) || (this.state.entity && (
                                this.renderEntity()
                            ))}
                        </div>
                    </ResizeHorizon>
                </Resize>
            </div>
        );
    }

    renderEntity() {
        const viewsMap = {
            [ClassType.ENUM]: EnumView,
            [ClassType.FORM]: ModelView,
            [ClassType.MODEL]: ModelView,
        };
        const EntityView = viewsMap[this.props.match.params.type];
        if (EntityView) {
            return (
                <EntityView
                    entity={this.state.entity}
                    initialValues={{
                        namespace: this.props.match.params.namespace,
                        name: this.props.match.params.name,
                        ...this.state.entity,
                    }}
                    types={this.props.types}
                    classesByType={this.state.classesByType}
                    classType={this.props.match.params.type}
                    onSubmit={this._onEntitySubmit}
                />
            );
        }

        return null;
    }

    _extractClasses(items) {
        let classes = {};
        (items || []).forEach((item) => {
            if (item.type && item.className) {
                classes[item.type] = classes[item.type] || [];
                classes[item.type].push(item.className);
            }
            classes = {
                ...classes,
                ...this._extractClasses(item.items),
            };
        });
        return classes;
    }

    _fetchEntity() {
        const params = _get(this.props, 'match.params');
        if (params.type && params.namespace && params.name) {
            this.props.http.get(`/api/gii/entities/${params.type}/${params.namespace}/${params.name}`)
                .then(entity => {
                    this.setState({
                        entity,
                        isLoading: false,
                    });
                });
            return {isLoading: true};
        }
    }

    _onEntitySubmit(values) {

    }

}
