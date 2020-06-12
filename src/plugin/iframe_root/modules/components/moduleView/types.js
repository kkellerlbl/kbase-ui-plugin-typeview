define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_knockout/lib/generators',
    'kb_lib/html',
    '../table',
    '../typeLink'
], function (
    ko,
    reg,
    ViewModelBase,
    gen,
    html,
    TableComponent,
    TypeLinkComponent
) {
    'use strict';

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.moduleName = params.moduleName;

            this.moduleInfo = params.moduleInfo;

            this.typesTable = ko.pureComputed(() => {
                return Object.keys(params.moduleInfo().types).map((typeId) => {
                    const [,typeName, typeVer] = typeId.match(/^(.+?)-(.+?)$/);
                    return {
                        name: typeName,
                        version: typeVer,
                        id: typeId
                    };
                });
            });

            this.tableDef = {
                style: {
                    maxHeight: '20em',
                    backgroundColor: '#FFF'
                },
                sort: {
                    column: ko.observable('name'),
                    direction: ko.observable('desc')
                },
                messages: {
                    empty: 'No types are specified in this module'
                },
                columns: [
                    {
                        name: 'name',
                        label: 'Type name',
                        width: 50,
                        component: {
                            name: TypeLinkComponent.name(),
                            params: {
                                name: 'name',
                                id: 'id'
                            }
                        },
                        sort: {
                            comparator: (a, b) => {
                                if (a < b) {
                                    return -1;
                                } else if (a > b) {
                                    return 1;
                                }
                                return 0;
                            }
                        }
                    },
                    {
                        name: 'version',
                        label: 'Type version',
                        width: 50,
                        sort: {
                            comparator: (a, b) => {
                                return (parseFloat(b) - parseFloat(a));
                            }
                        },
                        style: {
                            fontFamily: 'monospace'
                        }
                    }
                ]
            };
            this.tableDef.columnMap = this.tableDef.columns.reduce((map, column) => {
                map[column.name] = column;
                return map;
            }, {});
        }
    }

    const t = html.tag,
        div = t('div'),
        p = t('p');

    function template() {
        return div({
            style: {
                marginTop: '10px',
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        },[
            div([
                p([
                    'This table shows all types defined by this module: ',
                    gen.text('moduleName'),
                    ', version ',
                    gen.text('moduleInfo().ver'),
                    '.'
                ])
            ]),
            div({
                style: {
                    marginTop: '10px',
                    flex: '1 1 0px',
                    display: 'flex',
                    flexDirection: 'column'
                },
                dataBind: {
                    component: {
                        name: TableComponent.quotedName(),
                        params: {
                            table: 'tableDef',
                            rows: 'typesTable'
                        }
                    }
                }
            })
        ]);
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});
