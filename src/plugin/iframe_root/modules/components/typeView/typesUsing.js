define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/viewModelBase',
    'kb_knockout/lib/generators',
    'kb_lib/html',
    '../table',
    '../typeLink'
], function (ko, reg, ViewModelBase, gen, html, TableComponent, TypeLinkComponent) {
    'use strict';

    const TABLE_DEF = {
        style: {
            maxHeight: '20em',
            backgroundColor: '#FFF'
        },
        sort: {
            column: ko.observable('name'),
            direction: ko.observable('desc')
        },
        messages: {
            empty: 'No other types are using this type'
        },
        columns: [
            {
                name: 'name',
                label: 'Type ID',
                width: 50,
                component: {
                    name: TypeLinkComponent.name(),
                    params: {
                        name: 'name',
                        id: 'id',
                        tab: '"overview"'
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
                        // okay, the version is major.minor, which looks enough like
                        // a float that we can just sort like that :)
                        return parseFloat(b) - parseFloat(a);
                    }
                },
                style: {
                    fontFamily: 'monospace'
                }
            }
        ]
    };
    TABLE_DEF.columnMap = TABLE_DEF.columns.reduce((map, column) => {
        map[column.name] = column;
        return map;
    }, {});

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.typeInfo = ko.pureComputed(() => {
                const [, typeId, , , version, ,] = /^(([^.]+)\.([^-]+))-(([^.]+)\.(.*))$/.exec(
                    params.typeInfo().type_def
                );
                return {
                    typeId, version
                };
            });

            this.table = ko.pureComputed(() => {
                return params.typeInfo().using_type_defs.map((typeId) => {
                    const [, typeName, typeVer] = typeId.match(/^(.+?)-(.+?)$/);
                    return {
                        name: typeName,
                        version: typeVer,
                        id: typeId
                    };
                });
            });

            this.tableDef = TABLE_DEF;
        }
    }

    const t = html.tag,
        div = t('div'),
        p = t('p');

    function template() {
        return div(
            {
                style: {
                    marginTop: '10px',
                    flex: '1 1 0px',
                    display: 'flex',
                    flexDirection: 'column'
                }
            },
            [
                div([
                    p([
                        'This table shows all other types which use this type: ',
                        gen.text('typeInfo().typeId'),
                        ', version ',
                        gen.text('typeInfo().version'),
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
                                rows: 'table'
                            }
                        }
                    }
                })
            ]
        );
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});
